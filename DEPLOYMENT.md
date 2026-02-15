# Railway Deployment Notes

## Backend (this repo)

Set these Railway variables:

- `PORT` (Railway injects this automatically)
- `NODE_ENV=production`
- `CORS_ORIGINS=https://salesauto-frontend.up.railway.app`

The backend start command is defined in `railway.json` and `package.json`:

- `npm run start`

## Frontend API base URL

For frontend deployment, point API calls to the Railway backend URL:

- `https://salesauto-backend.up.railway.app/api`

If using Vite, set:

- `VITE_API_BASE_URL=https://salesauto-backend.up.railway.app/api`

If using Next.js, set:

- `NEXT_PUBLIC_API_BASE_URL=https://salesauto-backend.up.railway.app/api`

## Recommended deployment checks

1. Deploy backend and verify `GET /health` returns 200.
2. Confirm frontend requests target `VITE_API_BASE_URL`/`NEXT_PUBLIC_API_BASE_URL`.
3. Validate CORS by loading frontend from production domain.
