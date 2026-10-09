# Notes for working on this repo in the Base44 sandbox

## Running it

```sh
docker compose -f docker-compose.base44.yml up -d
# app on http://localhost:3000
docker compose -f docker-compose.base44.yml logs -f convex-setup
```

| service | what it is |
| --- | --- |
| `convex-backend` | Self-hosted Convex (official `ghcr.io/get-convex/convex-backend` image, SQLite + local file storage in the `convex-data` volume). No published host port. |
| `convex-admin-key` | One-shot: derives the deployment admin key into the data volume. |
| `convex-setup` | One-shot (`scripts/base44-convex-setup.sh`): pnpm install, deployment env, push, seed. |
| `web` | Vite dev server on port 3000 (`node:22`, repo bind-mounted, deps in the `node_modules` volume). Live reload works. |

## Non-obvious things

- **Convex runs self-hosted, not on Convex cloud.** The public app origin doubles as the
  deployment URL: `server.proxy` in `vite.config.ts` forwards `/api` (including the sync
  websocket) to `convex-backend:3210` and `/.well-known` to its HTTP-actions port `3211`.
  `VITE_CONVEX_URL` is supplied by compose, not by `.env.local`.
- **Convex Auth env vars are deployment env vars, not container env vars:**
  `JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL` are set with `npx convex env set` by the setup
  service. The signing keys are generated once into `convex-data/base44/` so sessions
  survive restarts.
- **Seeding** is `npx convex run seedData:seedProducts` (idempotent, no UI for it).
- Seeded product images point at `/api/placeholder/400/400`, which nothing in this repo
  implements, so product images render broken until real URLs are used. (The Vite proxy
  forwards `/api/*` to Convex, which answers 404; the browser logs
  `Failed to load img api/placeholder/400/400` for each one. Known data issue, not a setup bug.)
- The newsletter/welcome emails in `src/convex/emails.ts` need `RESEND_API_KEY` (deployment
  env var, optional). Without it those two actions throw.
- **Auth is not exercisable here as shipped.** Google is disabled, the "Continue as Guest"
  button is commented out in `src/pages/Auth.tsx`, and the email OTP provider needs
  `RESEND_API_KEY` (see `src/convex/auth/emailOtp.ts`). The storefront, catalogue, search and
  policies all render without signing in.
- `main.ts` (Deno/Hono static file server) is for external hosting and is unused here.

## Sandbox overrides

`vite.config.ts` applies its sandbox server block (host/port/proxy) only when
`BASE44_PREVIEW_MODE === "1"`. With the variable unset or set to anything else, Vite keeps
its original defaults (port 5173, no proxy), so normal local development is unchanged.

`convex-backend` sets `RUST_LOG` in `docker-compose.base44.yml` to soften four known-benign
warning targets that would otherwise fill the sandbox log on every push/reload: `common::errors`
(abrupt client WebSocket disconnects, malformed probes), `isolate::environment::analyze`
(routes Convex Auth registers dynamically, which the static analyzer cannot resolve),
`model::components::config` (modules outside the function map), and `local_backend`
(self-hosted startup note that UDF `fetch` is unrestricted). Each is pinned to `error`, so real
errors still surface; everything else keeps the default `info` level. This is log verbosity
only - it changes no runtime behaviour - and it applies wherever this compose file is used.

## Verifying

- `curl -sI http://localhost:3000/` returns 200 HTML.
- The storefront reads products from Convex: if the seeded catalogue renders and the browser
  console has no Convex connection errors, the frontend⇄backend link is healthy.
- Auth keys/JWKS: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/.well-known/jwks.json`
  (and `/.well-known/openid-configuration`) must return 200 - that exercises the
  `JWT_PRIVATE_KEY`/`JWKS`/`SITE_URL` deployment env vars without needing a sign-in UI.
- The backend log should stay free of `WARN`/`ERROR` after a push: with the `RUST_LOG`
  override above, a clean boot and deploy produce none.
