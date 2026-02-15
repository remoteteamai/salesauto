# Railway Deployment Guide

## 1) Production readiness checklist

This project is configured for Railway production deployment:

- **Start script**: `npm run start` in `package.json`
- **PORT support**: backend listens on `process.env.PORT`
- **Environment-driven config**: CORS and runtime behavior come from env vars
- **CORS support**: `CORS_ORIGINS` controls allowed frontend origins
- **Healthcheck endpoint**: `/health` (and `/api/health` alias)

### Required environment variables

Set these in Railway service variables:

- `NODE_ENV=production`
- `CORS_ORIGINS=https://your-frontend-domain.up.railway.app`
- `DATABASE_URL` (if database-backed)
- `JWT_SECRET` / `API_KEY` (if auth/integrations are used)

> Railway injects `PORT` automatically at runtime.

---

## 2) Railway deployment configuration

This repo includes `railway.json` configured for Node.js/Express:

- `startCommand`: `npm run start`
- `healthcheckPath`: `/health`
- restart policy on failure

If you change your framework later, update `railway.json` to match the framework’s start/build behavior.

---

## 3) Connect GitHub repo to Railway

1. Open Railway dashboard: **New Project**.
2. Select **Deploy from GitHub repo**.
3. Authorize Railway GitHub access if prompted.
4. Choose this repository and target branch.
5. Railway detects Node project (`package.json`) and provisions build/deploy.
6. Open your created service and go to **Variables**.
7. Add production variables (`NODE_ENV`, `CORS_ORIGINS`, secrets, DB URLs).
8. Trigger a deploy (or push a new commit).

Tip: use separate Railway environments (e.g., `staging`, `production`) with distinct variable sets.

---

## 4) Verify deployment logs and fix startup errors

### Check logs

1. Open Railway project → service → **Deployments**.
2. Click latest deployment and inspect:
   - **Build logs** (dependency install/build problems)
   - **Runtime logs** (app startup and request errors)

### What “good” looks like

- Log line similar to: `Server listening on port <PORT>`
- Healthcheck reports passing for `/health`
- No repeated restart/crash loop in deployment timeline

### Common startup issues and fixes

1. **App crashes immediately**
   - Cause: missing env var.
   - Fix: set required vars in Railway **Variables** and redeploy.

2. **Healthcheck failing**
   - Cause: wrong health endpoint or app not binding Railway port.
   - Fix: ensure `app.listen(process.env.PORT)` and `healthcheckPath` matches route.

3. **CORS errors from frontend**
   - Cause: frontend domain missing from `CORS_ORIGINS`.
   - Fix: add exact frontend origin(s), comma-separated.

4. **502/503 after deploy**
   - Cause: app never becomes healthy.
   - Fix: review runtime logs for exception stack traces; validate env vars and route mounts.

5. **Dependency/build failure**
   - Cause: incompatible Node version or install errors.
   - Fix: keep `engines.node` current (`>=18`) and ensure lockfile/dependencies are valid.

---

## 5) Recommended best practices for Railway API deployment

- Keep all secrets in Railway Variables (never commit secrets).
- Use dedicated staging + production environments.
- Keep health endpoint lightweight and dependency-safe.
- Restrict CORS in production to exact known frontend domains.
- Use structured logs and include request IDs when possible.
- Add API rate limiting and authentication on sensitive routes.
- Add graceful shutdown handlers for clean deploy restarts.
- Monitor crash loops and latency in Railway metrics/deployment history.

---

## Quick smoke test after deploy

1. `GET https://<backend-domain>.up.railway.app/health`
2. `GET https://<backend-domain>.up.railway.app/api/health`
3. Load frontend and confirm API calls use the production API base URL.
