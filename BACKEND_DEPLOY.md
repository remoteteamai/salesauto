# Backend Deployment Guide

## Option 1: Railway (Recommended)

### Prerequisites
- Railway account (https://railway.app)
- Railway CLI: `npm i -g @railway/cli`

### Steps

1. **Create Railway Project**
```bash
cd apps/backend
railway login
railway init
```

2. **Add PostgreSQL Database**
```bash
railway add postgres
```

3. **Deploy**
```bash
railway up
```

4. **Set Environment Variables** (in Railway dashboard)
```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
DATABASE_URL=<auto-populated>
```

5. **Get Backend URL**
```bash
railway domain
```
This will give you your backend URL (e.g., `https://backend.up.railway.app`)

---

## Option 2: Render

1. Create account at https://render.com
2. Create "Web Service"
3. Connect GitHub repo or upload code
4. Settings:
   - Build Command: `npm run build`
   - Start Command: `node dist/main`
5. Add PostgreSQL database (Render will create one)
6. Set environment variables

---

## Option 3: Heroku

1. Create account at https://heroku.com
2. Install Heroku CLI
3. Create app:
```bash
heroku create melioro-backend
heroku addons:create heroku-postgresql:hobby-dev
```
4. Deploy:
```bash
git subtree push --prefix apps/backend heroku main
```
5. Set environment variables in Heroku dashboard

---

## Option 4: Docker + Any Cloud

### Build Docker Image
```bash
cd apps/backend
docker build -t melioro-backend .
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  melioro-backend
```

### Deploy to:
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

---

## Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `NODE_ENV` | Set to `production` | Yes |
| `PORT` | Server port (default: 4000) | No |

## Health Check

After deployment, verify:
```
GET https://your-backend-url.com/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-..."}
```

## Connect Frontend

After backend is deployed, add to Vercel:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```
