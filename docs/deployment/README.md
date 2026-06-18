# Deployment Guide

This guide covers deploying Melioro AI to various cloud platforms.

## Prerequisites

- Docker & Docker Compose (for single-server deployment)
- Kubernetes (for container orchestration)
- Terraform (for infrastructure provisioning)
- Domain name configured with DNS

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Application
NODE_ENV=production
APP_URL=https://melioro.ai
API_URL=https://api.melioro.ai

# Database
DATABASE_URL=postgresql://melioro:password@postgres:5432/melioro

# Redis
REDIS_URL=redis://:password@redis:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=noreply@melioro.ai

# AI Services
OPENAI_API_KEY=sk-...

# External APIs
CLEARBIT_API_KEY=...
HUNTER_API_KEY=...
```

---

## Docker Compose (Development/Staging)

### Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/melioro-ai.git
cd melioro-ai

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | PostgreSQL 15 |
| redis | 6379 | Redis 7 |
| backend | 4000 | NestJS API |
| frontend | 3000 | Next.js app |
| nginx | 80, 443 | Reverse proxy |
| prometheus | 9090 | Metrics |
| grafana | 3001 | Dashboards |

### Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Database Setup

```bash
# Generate Prisma client
docker-compose exec backend npx prisma generate

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database (optional)
docker-compose exec backend npx prisma db seed
```

---

## AWS Deployment

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CloudFront CDN                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Application Load Balancer                 │
│                     (melioro-alb)                            │
└──────┬──────────────────────────────────────┬───────────────┘
       │                                      │
┌──────▼──────────────────────────────────────▼───────────────┐
│                    ECS Fargate                                │
│  ┌─────────────────┐        ┌─────────────────┐             │
│  │   Backend (2+)  │        │  Frontend (2+)  │             │
│  │  Port: 4000     │        │  Port: 3000     │             │
│  └─────────────────┘        └─────────────────┘             │
└──────┬──────────────────────────────────────┬───────────────┘
       │                                      │
┌──────▼──────────────────────┐   ┌───────────▼────────────────┐
│       RDS PostgreSQL         │   │      ElastiCache Redis    │
│       (db.t3.medium)         │   │      (cache.t3.medium)    │
└─────────────────────────────┘   └───────────────────────────┘
```

### Deploy Steps

1. **Configure AWS CLI**

```bash
aws configure
aws configure set region us-east-1
```

2. **Create S3 bucket for Terraform state**

```bash
aws s3 mb s3://melioro-terraform-state
```

3. **Initialize Terraform**

```bash
cd infrastructure/terraform/aws
terraform init
```

4. **Plan deployment**

```bash
terraform plan \
  -var="environment=production" \
  -var="domain_name=melioro.ai" \
  -var="db_password=your-secure-password" \
  -var="ecr_backend_url=123456789.dkr.ecr.us-east-1.amazonaws.com/melioro-backend" \
  -var="ecr_frontend_url=123456789.dkr.ecr.us-east-1.amazonaws.com/melioro-frontend" \
  -var="certificate_arn=arn:aws:acm:us-east-1:123456789:certificate/xxx"
```

5. **Apply Terraform**

```bash
terraform apply \
  -var="environment=production" \
  -var="domain_name=melioro.ai" \
  -var="db_password=your-secure-password" \
  -var="ecr_backend_url=123456789.dkr.ecr.us-east-1.amazonaws.com/melioro-backend" \
  -var="ecr_frontend_url=123456789.dkr.ecr.us-east-1.amazonaws.com/melioro-frontend" \
  -var="certificate_arn=arn:aws:acm:us-east-1:123456789:certificate/xxx"
```

6. **Store secrets in Secrets Manager**

```bash
# Database URL
aws secretsmanager create-secret \
  --name melioro/database-url \
  --secret-string "postgresql://melioro:password@meliorodb.xxx.us-east-1.rds.amazonaws.com:5432/melioro"

# JWT Secret
aws secretsmanager create-secret \
  --name melioro/jwt-secret \
  --secret-string "your-super-secret-jwt-key-at-least-32-characters"
```

7. **Build and push Docker images**

```bash
# Login to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t melioro-backend:latest -f apps/backend/Dockerfile .
docker tag melioro-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/melioro-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/melioro-backend:latest

docker build -t melioro-frontend:latest -f apps/web/Dockerfile .
docker tag melioro-frontend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/melioro-frontend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/melioro-frontend:latest
```

8. **Update ECS service to pull new images**

```bash
aws ecs update-service --cluster melioro-cluster --service melioro-backend --force-new-deployment
aws ecs update-service --cluster melioro-cluster --service melioro-frontend --force-new-deployment
```

---

## Google Cloud Platform (GCP)

### Architecture

Uses Cloud Run for serverless containers, Cloud SQL for PostgreSQL, and Memorystore for Redis.

### Deploy Steps

1. **Enable APIs**

```bash
gcloud services enable compute.googleapis.com cloudbuild.googleapis.com run.googleapis.com sqladmin.googleapis.com redis.googleapis.com
```

2. **Create Cloud SQL instance**

```bash
gcloud sql instances create melioro-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-8192 \
  --region=us-central1 \
  --storage-size=100GB
```

3. **Create Memorystore Redis**

```bash
gcloud redis instances create melioro-cache \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0
```

4. **Build and deploy**

```bash
# Build with Cloud Build
gcloud builds submit --tag gcr.io/PROJECT_ID/melioro-backend:latest --dockerfile apps/backend/Dockerfile
gcloud builds submit --tag gcr.io/PROJECT_ID/melioro-frontend:latest --dockerfile apps/web/Dockerfile

# Deploy Backend
gcloud run deploy melioro-backend \
  --image gcr.io/PROJECT_ID/melioro-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production"

# Deploy Frontend
gcloud run deploy melioro-frontend \
  --image gcr.io/PROJECT_ID/melioro-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production"
```

---

## Azure Deployment

### Architecture

Uses Azure Container Apps, Azure Database for PostgreSQL, and Azure Cache for Redis.

### Deploy Steps

1. **Create resource group**

```bash
az group create --name melioro-rg --location eastus
```

2. **Create PostgreSQL**

```bash
az postgres server create \
  --resource-group melioro-rg \
  --name melioro-db \
  --admin-user melioro \
  --admin-password YOUR_PASSWORD \
  --sku-name B_Gen5_2
```

3. **Create Redis**

```bash
az redis create \
  --resource-group melioro-rg \
  --name melioro-cache \
  --sku-name Basic \
  --vm-size c0
```

4. **Deploy to Container Apps**

```bash
# Create container app environment
az containerapp env create \
  --name melioro-env \
  --resource-group melioro-rg \
  --location eastus

# Deploy backend
az containerapp create \
  --name melioro-backend \
  --resource-group melioro-rg \
  --environment melioro-env \
  --image ghcr.io/your-org/melioro-backend:latest \
  --target-port 4000 \
  --ingress external

# Deploy frontend
az containerapp create \
  --name melioro-frontend \
  --resource-group melioro-rg \
  --environment melioro-env \
  --image ghcr.io/your-org/melioro-frontend:latest \
  --target-port 3000 \
  --ingress external
```

---

## DigitalOcean

### Architecture

Uses App Platform with managed PostgreSQL and Redis.

### Deploy Steps

1. **Create App Platform App**

Create `app.yaml`:
```yaml
name: melioro
region: nyc
services:
  - name: backend
    github:
      repo: your-org/melioro-ai
      branch: main
      deploy_on_push: true
    dockerfile_path: apps/backend/Dockerfile
    instance_size_slug: professional-xs
    instance_count: 2
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
  - name: frontend
    github:
      repo: your-org/melioro-ai
      branch: main
      deploy_on_push: true
    dockerfile_path: apps/web/Dockerfile
    instance_size_slug: basic-xxs
    instance_count: 2
    http_port: 3000
    routes:
      - path: /
databases:
  - name: melioro-db
    engine: PG
    version: "15"
  - name: melioro-cache
    engine: REDIS
```

2. **Deploy**

```bash
doctl apps create --spec app.yaml
```

---

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (EKS, GKE, AKS, or self-managed)
- kubectl configured
- Helm 3+

### Deploy Steps

1. **Create namespace**

```bash
kubectl create namespace melioro
```

2. **Apply manifests**

```bash
kubectl apply -f infrastructure/k8s/deployment.yaml
```

3. **Install cert-manager for TLS**

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

4. **Create ClusterIssuer**

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@melioro.ai
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
```

5. **Verify deployment**

```bash
kubectl get pods -n melioro
kubectl get ingress -n melioro
```

---

## Post-Deployment

### Health Checks

```bash
# Backend health
curl https://api.melioro.ai/api/v1/health

# Frontend health
curl https://melioro.ai
```

### Database Migrations

Run migrations after deployment:

```bash
# With Docker
docker-compose exec backend npx prisma migrate deploy

# With Kubernetes
kubectl exec -it deployment/melioro-backend -n melioro -- npx prisma migrate deploy
```

### Monitoring Setup

1. **Set up Grafana dashboards**
   - Import dashboards from `infrastructure/docker/grafana/provisioning/dashboards/`

2. **Configure alerts**
   - Set up PagerDuty or Slack integrations for critical alerts

3. **Enable log aggregation**
   - Configure CloudWatch, Stackdriver, or ELK stack

---

## Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check database connectivity
kubectl exec -it deployment/melioro-backend -n melioro -- nc -zv postgres 5432
```

**Pods not starting**
```bash
# Check pod logs
kubectl logs -f deployment/melioro-backend -n melioro

# Check events
kubectl describe pod -n melioro
```

**Image pull failed**
```bash
# Verify image exists
docker images | grep melioro

# Check secret for private registry
kubectl get secret -n melioro
```

---

## Backup & Recovery

### Database Backups

PostgreSQL automatic backups are configured in Terraform (7-day retention).

Manual backup:
```bash
pg_dump -h postgres -U melioro melioro > backup.sql
```

### Restore from Backup

```bash
psql -h postgres -U melioro melioro < backup.sql
```

---

## Security Checklist

- [ ] All secrets stored in secrets manager
- [ ] TLS certificates configured
- [ ] Database credentials rotated
- [ ] Firewall rules restrict access
- [ ] Rate limiting enabled
- [ ] DDoS protection configured (CloudFlare/AWS Shield)
- [ ] Regular security updates applied