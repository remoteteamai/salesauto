#!/bin/bash
# ===========================================
# Melioro AI - Backend Deployment Script
# ===========================================

set -e

echo "🚀 Melioro AI Backend Deployment"
echo "================================"

# Check for Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login check
echo "🔐 Please login to Railway..."
railway login

# Initialize project
echo "📁 Initializing Railway project..."
cd apps/backend
railway init --name melioro-backend

# Add PostgreSQL
echo "🗄️ Adding PostgreSQL database..."
railway add postgres

# Deploy
echo "🚀 Deploying backend..."
railway up

# Get domain
echo "🌐 Your backend domain:"
railway domain

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set JWT_SECRET in Railway dashboard"
echo "2. Add NEXT_PUBLIC_API_URL to Vercel with your backend URL"
