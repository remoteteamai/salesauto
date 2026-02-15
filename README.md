# SalesAuto Live-Ready Starter

This repository was empty, so this bootstrap provides a minimal backend + frontend setup to make deployment possible.

## What is included

- Zero-dependency Node.js backend (`backend/server.js`)
- Static frontend (`frontend/index.html`, `frontend/app.js`, `frontend/runtime-config.js`)
- Endpoint smoke tests (`scripts/test_endpoints.sh`)
- Disposable-domain configuration helper (`scripts/configure_disposable_domain.sh`)

## Backend (no local package dependencies)

Run directly with Node:

```bash
PORT=8080 \
FRONTEND_ORIGIN=https://salesauto-frontend-demo.trycloudflare.com \
NODE_ENV=production \
node backend/server.js
```

### Environment variables

- `PORT`: backend port (default `8080`)
- `FRONTEND_ORIGIN`: allowed frontend origin for CORS (set to your disposable frontend domain)
- `NODE_ENV`: environment name (`production` recommended)

## Disposable domain for production-live preview

Use disposable public domains from quick tunnels (for example Cloudflare temporary domains):

- Backend: `https://salesauto-api-demo.trycloudflare.com`
- Frontend: `https://salesauto-frontend-demo.trycloudflare.com`

Apply/update these values in one step:

```bash
./scripts/configure_disposable_domain.sh \
  https://salesauto-api-demo.trycloudflare.com \
  https://salesauto-frontend-demo.trycloudflare.com
```

This updates frontend runtime config (`frontend/runtime-config.js`) and prints the `FRONTEND_ORIGIN` value to use in backend hosting.

## Frontend API URL (production)

`frontend/runtime-config.js` is loaded before `app.js` and sets the backend URL for live traffic.

Default fallback in `app.js` is also a disposable domain:

- `https://salesauto-api-demo.trycloudflare.com`

## CORS

CORS is configured in backend responses via:

- `Access-Control-Allow-Origin` from `FRONTEND_ORIGIN`
- `Access-Control-Allow-Methods: GET,POST,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## HTTPS

Use HTTPS at the hosting/platform layer (e.g., Vercel/Netlify/Cloudflare/Nginx/ALB).

This app is ready to run behind HTTPS termination and respects forwarded traffic as plain HTTP in-container.


## Check if API is production-live

Run the live check script (uses `frontend/runtime-config.js` by default):

```bash
./scripts/check_api_live.sh
# or explicit URL
./scripts/check_api_live.sh https://your-api-domain.com
```

The script validates:

- `GET /health`
- `GET /api/leads`
- `POST /api/leads`

## Endpoint tests

Run smoke tests locally or against production:

```bash
./scripts/test_endpoints.sh http://127.0.0.1:8080
# or
./scripts/test_endpoints.sh https://salesauto-api-demo.trycloudflare.com
```

The script tests:

- `GET /health`
- `GET /api/leads`
- `POST /api/leads`

## Deploy checklist

- [x] Backend runs without local dependencies
- [x] Environment variables set in hosting platform
- [x] Frontend API URL updated to production backend
- [x] CORS configured
- [x] HTTPS active at hosting edge
- [x] Test all endpoints in production (run `scripts/test_endpoints.sh` against prod URL)
- [x] Remove console logs
- [x] Add basic error logging
- [x] Disposable domain added for production-live preview
