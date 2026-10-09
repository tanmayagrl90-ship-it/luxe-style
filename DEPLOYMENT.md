# Deploying LUXE (Vercel + Convex)

The storefront is a Vite SPA and its backend is a Convex deployment. Hosting the frontend on
Vercel is only half the job: the page loads and then every query fails until it can reach a
**healthy** Convex deployment. Work done in the Base44 sandbox lives on its own branch - nothing
reaches the domain until it lands on `main`.

## 1. Frontend on Vercel

Verified locally with `pnpm build` (= `tsc -b && vite build`): typecheck passes, output is
`dist/`.

| setting | value |
| --- | --- |
| Install command | `pnpm install` |
| Build command | `pnpm build` |
| Output directory | `dist` |
| Production branch | `main` |

Routing uses `createBrowserRouter`, so client routes (`/category/:category`, `/product/:id`,
`/checkout`, ...) need an SPA fallback: a rewrite of `/(.*)` to `/index.html` in the Vercel
project settings. Client routes currently resolve on the live domain, so this appears to be
configured already.

Required environment variable, for **Production and Preview**:

- `VITE_CONVEX_URL` - the Convex deployment URL the frontend talks to, e.g.
  `https://<deployment-name>.convex.cloud`. Vite inlines it at build time, so changing it needs
  a redeploy, not just a restart.

## 2. Convex backend

`VITE_CONVEX_URL` must point at a deployment that has this repo's functions pushed to it, with
Convex Auth configured:

```sh
npx convex deploy                      # push src/convex/* to the deployment
npx convex env set SITE_URL -- https://www.luxepremium.in
npx convex env set JWT_PRIVATE_KEY -- "<pkcs8 PEM on a single line>"
npx convex env set JWKS -- '<jwks json>'
npx convex run seedData:seedProducts   # first run only; the catalogue
```

`scripts/base44-convex-keys.mjs` generates a matching `JWT_PRIVATE_KEY`/`JWKS` pair if you need
a fresh one - the same script the sandbox setup uses. `SITE_URL` must be the exact origin users
load the site from, because Convex Auth validates it against the request origin.

Optional: `RESEND_API_KEY` (and `RESEND_FROM_EMAIL`) enables the newsletter/welcome emails in
`src/convex/emails.ts`, and is required for the email-OTP sign-in provider to actually send codes.

## 3. Domain

`luxepremium.in` is already delegated to Vercel (apex `A` record `216.198.79.1`, `www` CNAME to
`...vercel-dns-017.com`) and redirects `luxepremium.in` -> `www.luxepremium.in`. Add both hostnames
to the Vercel project that serves the storefront, then confirm
`https://www.luxepremium.in` loads the catalogue rather than an error screen.

## Known blocker (as of the last check)

The deployment the live site points at, `harmless-tapir-303.convex.cloud`, is **disabled**:
"exceeded a configured usage limit" - see the Convex dashboard for that deployment, Settings ->
usage limits. Until it is re-enabled, or `VITE_CONVEX_URL` is repointed at another healthy
deployment, the live site loads and then shows a React Router error screen.

Two related notes:

- Storage URLs hardcoded in `src/components/*` and `src/convex/seedData.ts` reference
  `harmless-tapir-303`, because Convex file storage is per-deployment. Those images would need
  re-uploading and the URLs replacing if you move to a different deployment.
- Some seeded products still use the placeholder path `/api/placeholder/400/400`, which nothing
  in this repo implements, so those product images render broken regardless of deployment.
