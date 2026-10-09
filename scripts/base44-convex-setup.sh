#!/usr/bin/env bash
# Base44 sandbox: prepare the self-hosted Convex deployment used by this app.
#
# Runs as the one-shot `convex-setup` service in docker-compose.base44.yml:
#   1. installs dependencies from the lockfile into the shared node_modules volume
#   2. configures the deployment environment (Convex Auth signing keys, SITE_URL)
#   3. pushes the schema and Convex functions
#   4. seeds the product catalogue
#
# Idempotent - safe to run on every `docker compose up`.
set -euo pipefail

cd /app

: "${CONVEX_SELF_HOSTED_URL:=http://convex-backend:3210}"
: "${APP_ORIGIN:?APP_ORIGIN must be set to the public app URL}"
export CONVEX_SELF_HOSTED_URL
export CONVEX_SELF_HOSTED_ADMIN_KEY="$(cat /convex-data/base44/admin_key)"

# Shared state (also holds the admin key next to the Convex data volume).
STATE_DIR=/convex-data/base44

echo "[base44] Installing dependencies"
# Explicit store dir keeps pnpm from creating .pnpm-store inside the project.
CI=true pnpm install --frozen-lockfile --store-dir "${PNPM_STORE_DIR:-/pnpm-store}"

echo "[base44] Waiting for the Convex backend"
for _ in $(seq 1 60); do
  if node -e "fetch(process.env.CONVEX_SELF_HOSTED_URL + '/version').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"; then
    break
  fi
  sleep 2
done

# Convex Auth needs an RS256 key pair on the deployment. Generate it once and
# keep it in the data volume so existing sessions survive restarts/rebuilds.
if [ ! -f "$STATE_DIR/jwt_private_key" ]; then
  echo "[base44] Generating Convex Auth signing keys"
  node scripts/base44-convex-keys.mjs "$STATE_DIR/jwt_private_key" "$STATE_DIR/jwks"
fi

echo "[base44] Configuring the deployment environment"
# `--` keeps the multi-line PEM / JSON values from being parsed as CLI flags.
npx convex env set JWT_PRIVATE_KEY -- "$(cat "$STATE_DIR/jwt_private_key")"
npx convex env set JWKS -- "$(cat "$STATE_DIR/jwks")"
npx convex env set SITE_URL -- "$APP_ORIGIN"
# Optional: newsletter / welcome emails (src/convex/emails.ts).
if [ -n "${RESEND_API_KEY:-}" ]; then
  npx convex env set RESEND_API_KEY -- "$RESEND_API_KEY"
fi
if [ -n "${RESEND_FROM_EMAIL:-}" ]; then
  npx convex env set RESEND_FROM_EMAIL -- "$RESEND_FROM_EMAIL"
fi

echo "[base44] Pushing schema and functions"
npx convex dev --once

echo "[base44] Seeding the product catalogue"
npx convex run seedData:seedProducts

echo "[base44] Setup complete"
