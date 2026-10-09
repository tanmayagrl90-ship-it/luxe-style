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
  implements, so product images render broken until real URLs are used.
- The newsletter/welcome emails in `src/convex/emails.ts` need `RESEND_API_KEY` (deployment
  env var, optional). Without it those two actions throw.
- `main.ts` (Deno/Hono static file server) is for external hosting and is unused here.

## Sandbox overrides

`vite.config.ts` applies its sandbox server block (host/port/proxy) only when
`BASE44_PREVIEW_MODE === "1"`. With the variable unset or set to anything else, Vite keeps
its original defaults (port 5173, no proxy), so normal local development is unchanged.

## Verifying

- `curl -sI http://localhost:3000/` returns 200 HTML.
- The storefront reads products from Convex: if the seeded catalogue renders and the browser
  console has no Convex connection errors, the frontend⇄backend link is healthy.
- Auth: sign in anonymously (or with the email OTP on `/auth`) and check that
  `useAuth().isAuthenticated` flips to true - that exercises the Convex Auth keys, JWKS
  round-trip and `SITE_URL` together.
