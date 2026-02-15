# SalesAuto Live-Ready Starter

This repository was empty, so this bootstrap provides a minimal backend + frontend setup to make deployment possible.

## What is included

- Zero-dependency Node.js backend (`backend/server.js`)
- Static frontend (`frontend/index.html`, `frontend/app.js`)
- Endpoint smoke tests (`scripts/test_endpoints.sh`)

## Backend (no local package dependencies)

Run directly with Node:

```bash
PORT=8080 \
FRONTEND_ORIGIN=https://salesauto-frontend.example.com \
NODE_ENV=production \
node backend/server.js
```

### Environment variables

- `PORT`: backend port (default `8080`)
- `FRONTEND_ORIGIN`: allowed frontend origin for CORS (default `*`)
- `NODE_ENV`: environment name (`production` recommended)

## Frontend API URL (production)

`frontend/app.js` defaults to production API URL:

- `https://api.salesauto.example.com`

Override by defining at runtime before loading `app.js`:

```html
<script>
  window.__API_BASE_URL__ = "https://your-real-backend-domain.com";
</script>
```

## CORS

CORS is configured in backend responses via:

- `Access-Control-Allow-Origin` from `FRONTEND_ORIGIN`
- `Access-Control-Allow-Methods: GET,POST,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## HTTPS

Use HTTPS at the hosting/platform layer (e.g., Vercel/Netlify/Cloudflare/Nginx/ALB).

This app is ready to run behind HTTPS termination and respects forwarded traffic as plain HTTP in-container.

## Endpoint tests

Run smoke tests locally:

```bash
./scripts/test_endpoints.sh http://127.0.0.1:8080
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
