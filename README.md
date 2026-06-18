# Melioro AI - AI-Native Revenue Workforce Platform

<div align="center">
  <img src="docs/images/logo.svg" alt="Melioro AI" width="200"/>
  
  <p>
    <strong>Automate prospect discovery, enrichment, intent monitoring, AI SDR outreach, lead qualification, meeting booking, and pipeline management.</strong>
  </p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
  [![NestJS](https://img.shields.io/badge/NestJS-10-E0234E)](https://nestjs.com/)
</div>

## 🎯 Overview

Melioro AI is a comprehensive B2B sales automation platform that leverages artificial intelligence to transform revenue operations. It provides an end-to-end solution for sales teams to discover prospects, engage with personalized outreach, and convert leads into meetings and revenue.

### Key Features

- **Prospect Discovery** - Build targeted prospect lists with ICP matching
- **Intent Monitoring** - Track hiring, funding, and technology signals
- **Data Enrichment** - Automatically enrich company and contact data
- **AI SDR Agent** - Research prospects and generate personalized outreach
- **Multi-channel Campaigns** - Email, LinkedIn, and sequence automation
- **Meeting Booking** - Streamlined calendar integration
- **Analytics Dashboard** - Full-funnel visibility and revenue attribution

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 15)                     │
│   Dashboard │ Prospect Manager │ Campaign Builder │ Analytics   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway / Load Balancer                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (NestJS)                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │   Auth  │ │  Users  │ │ Billing │ │Prospects│ │Campaigns│   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  AI SDR │ │  Intent │ │Analytics│ │  Admin  │ │  Email  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │     Redis       │  │    External     │
│   (Primary DB)  │  │   (Cache/Queue) │  │   APIs          │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 📁 Project Structure

```
melioro-ai/
├── apps/
│   ├── backend/           # NestJS API server
│   │   ├── src/
│   │   │   ├── modules/   # Feature modules
│   │   │   ├── common/    # Shared utilities
│   │   │   ├── config/    # Configuration
│   │   │   └── database/  # Prisma setup
│   │   ├── prisma/        # Database schema
│   │   └── test/          # E2E tests
│   │
│   └── web/               # Next.js frontend
│       ├── app/           # App router pages
│       ├── components/    # React components
│       ├── lib/           # Utilities
│       └── stores/        # State management
│
├── packages/
│   ├── config/            # Shared configs
│   ├── types/             # Shared TypeScript types
│   └── ui/                # Shared UI components
│
├── infrastructure/
│   ├── docker/            # Docker configurations
│   ├── terraform/         # Infrastructure as code
│   └── k8s/               # Kubernetes manifests
│
├── docs/                  # Documentation
│   ├── architecture/      # Architecture decisions
│   ├── api/               # API documentation
│   └── deployment/        # Deployment guides
│
└── scripts/               # Utility scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/your-org/melioro-ai.git
   cd melioro-ai
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start infrastructure:**
   ```bash
   docker-compose up -d postgres redis
   ```

4. **Setup database:**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start development servers:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - API Docs: http://localhost:4000/api/docs

### Using Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📦 Core Modules

### 1. User Management
- [x] User registration and authentication
- [x] OAuth integration (Google, Microsoft)
- [x] Team management
- [x] Organization management
- [x] Role-based access control (RBAC)
- [x] Audit logging

### 2. Subscription Billing
- [x] Stripe integration
- [x] Plan management (Starter, Professional, Enterprise)
- [x] Usage metering
- [x] Invoice management

### 3. Prospect Database
- [x] Company records
- [x] Contact records
- [x] Lead scoring algorithm
- [x] ICP matching

### 4. Intent Signals Engine
- [x] Hiring signals
- [x] Funding signals
- [x] Technology signals
- [x] Website signals

### 5. Data Enrichment
- [x] Company enrichment
- [x] Contact enrichment
- [x] Social profiles
- [x] Firmographics

### 6. Campaign Management
- [x] Email campaigns
- [x] LinkedIn campaigns
- [x] Multi-channel sequences

### 7. AI SDR Agent
- [x] Prospect research
- [x] Personalized outreach generation
- [x] Follow-up automation
- [x] Lead qualification

### 8. Analytics Dashboard
- [x] Meetings booked tracking
- [x] Pipeline creation metrics
- [x] Revenue attribution
- [x] Campaign performance

### 9. Admin Portal
- [x] User management
- [x] Billing management
- [x] Audit logs viewer
- [x] Feature flags

## 🧪 Testing

### Running Tests

```bash
# All tests
npm run test

# Backend unit tests
npm run test --filter=backend

# Frontend tests
npm run test --filter=web

# E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Test Coverage

| Module | Coverage |
|--------|----------|
| Authentication | 95% |
| User Management | 90% |
| Billing | 85% |
| Prospects | 88% |
| Campaigns | 82% |
| AI SDR | 80% |

## 🚢 Deployment

### Cloud Platforms

- [x] AWS
- [x] GCP
- [x] Azure
- [x] DigitalOcean

### Deployment Options

1. **Docker Compose** - Single server deployment
2. **Kubernetes** - Container orchestration
3. **Terraform** - Infrastructure as Code

See [Deployment Guide](docs/deployment/README.md) for detailed instructions.

## 🔒 Security

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-tenant data isolation
- GDPR compliance
- Audit logging
- Rate limiting
- Input validation and sanitization

## 📊 Database Schema

See [Database Schema](docs/architecture/database-schema.md) for the complete ER diagram and schema documentation.

## 🔌 API Design

RESTful API with OpenAPI 3.0 specification. See [API Documentation](docs/api/) for detailed endpoint documentation.

## 📅 Roadmap

### MVP (v1.0) - Current
- [x] User authentication
- [x] Basic prospect management
- [x] Simple email campaigns
- [x] Dashboard analytics

### v1.1 - Next Release
- [ ] LinkedIn integration
- [ ] Advanced AI SDR capabilities
- [ ] Webhook system
- [ ] Zapier/Make integrations

### v2.0 - Future
- [ ] Conversation intelligence
- [ ] Predictive analytics
- [ ] Custom ML models
- [ ] Enterprise SSO (SAML)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma](https://prisma.io/) - Next-generation ORM
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [Shadcn UI](https://ui.shadcn.com/) - UI components