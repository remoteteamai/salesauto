# Melioro AI REST API Documentation

## Base URL

```
Production: https://api.melioro.ai/api/v1
Development: http://localhost:4000/api/v1
```

## Authentication

### Bearer Token

All API requests (except auth endpoints) require Bearer token authentication:

```
Authorization: Bearer <access_token>
```

### Response Format

All responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Paginated responses include metadata:

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Responses

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "BadRequestException",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/prospects"
}
```

---

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "john@acme.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "Acme Corp"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@acme.com",
      "firstName": "John",
      "lastName": "Doe",
      "organizationId": "uuid",
      "isSuperAdmin": false
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresIn": 604800
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@acme.com",
  "password": "SecurePass123!"
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}
```

### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@acme.com"
}
```

### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "email": "john@acme.com",
  "token": "reset_token",
  "newPassword": "NewSecurePass123!"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

---

## Users

### Get Profile
```http
GET /users/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "timezone": "America/New_York"
}
```

### List Users (Admin)
```http
GET /users?page=1&limit=20&search=john&isActive=true
Authorization: Bearer <token>
```

---

## Organizations

### Get Organization
```http
GET /organizations/me
Authorization: Bearer <token>
```

### Update Organization
```http
PUT /organizations/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Inc",
  "industry": "Technology",
  "size": "51-200"
}
```

### Upload Logo
```http
PATCH /organizations/me/logo
Authorization: Bearer <token>
Content-Type: multipart/form-data

logo: <file>
```

### Get Organization Stats
```http
GET /organizations/me/stats
Authorization: Bearer <token>
```

---

## Prospects

### List Prospects
```http
GET /prospects?page=1&limit=20&stage=QUALIFIED&priority=HIGH
Authorization: Bearer <token>
```

### Create Prospect
```http
POST /prospects
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyId": "uuid",
  "contactId": "uuid",
  "priority": "HIGH",
  "notes": "Interested in enterprise plan"
}
```

### Get Prospect
```http
GET /prospects/:id
Authorization: Bearer <token>
```

### Update Prospect
```http
PUT /prospects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "stage": "ENGAGED",
  "priority": "CRITICAL",
  "notes": "Scheduled demo for next week"
}
```

### Delete Prospect (Archive)
```http
DELETE /prospects/:id
Authorization: Bearer <token>
```

### Bulk Create Prospects
```http
POST /prospects/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "prospects": [
    {
      "companyId": "uuid1",
      "contactId": "uuid1",
      "priority": "HIGH"
    },
    {
      "companyId": "uuid2",
      "contactId": "uuid2",
      "priority": "MEDIUM"
    }
  ]
}
```

### Get Prospect Stats
```http
GET /prospects/stats
Authorization: Bearer <token>
```

---

## Companies

### List Companies
```http
GET /companies?page=1&limit=20&industry=Technology&icpMatched=true
Authorization: Bearer <token>
```

### Create Company
```http
POST /companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech Corp",
  "domain": "techcorp.com",
  "industry": "Technology",
  "employeeCount": 500
}
```

### Enrich Company
```http
POST /companies/:id/enrich
Authorization: Bearer <token>
```

### Match ICP
```http
GET /companies/match-icp
Authorization: Bearer <token>
```

---

## Campaigns

### List Campaigns
```http
GET /campaigns?status=ACTIVE&type=EMAIL
Authorization: Bearer <token>
```

### Create Campaign
```http
POST /campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Q1 Outreach",
  "type": "EMAIL",
  "description": "Q1 enterprise prospects"
}
```

### Get Campaign
```http
GET /campaigns/:id
Authorization: Bearer <token>
```

### Update Campaign
```http
PUT /campaigns/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Q1 Outreach - Updated",
  "status": "ACTIVE"
}
```

### Start Campaign
```http
POST /campaigns/:id/start
Authorization: Bearer <token>
```

### Pause Campaign
```http
POST /campaigns/:id/pause
Authorization: Bearer <token>
```

---

## Sequences

### Create Sequence
```http
POST /campaigns/:campaignId/sequences
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Follow-up Sequence",
  "steps": [
    {
      "stepOrder": 1,
      "type": "EMAIL",
      "channel": "EMAIL",
      "subject": "Quick follow-up",
      "bodyTemplate": "Hi {{contact.firstName}}...",
      "delayDays": 0
    },
    {
      "stepOrder": 2,
      "type": "EMAIL",
      "channel": "EMAIL",
      "subject": "Checking in",
      "bodyTemplate": "Hi {{contact.firstName}}...",
      "delayDays": 3
    }
  ]
}
```

---

## Analytics

### Get Dashboard Metrics
```http
GET /analytics/dashboard?period=30d
Authorization: Bearer <token>
```

### Get Campaign Performance
```http
GET /analytics/campaigns/:id
Authorization: Bearer <token>
```

### Get Funnel Analytics
```http
GET /analytics/funnel
Authorization: Bearer <token>
```

### Track Event
```http
POST /analytics/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventType": "cta_clicked",
  "eventCategory": "engagement",
  "eventData": {
    "cta_id": "pricing_cta",
    "page": "/pricing"
  }
}
```

---

## AI SDR

### Research Prospect
```http
POST /ai-sdr/research
Authorization: Bearer <token>
Content-Type: application/json

{
  "prospectId": "uuid",
  "type": "FULL"
}
```

### Generate Outreach
```http
POST /ai-sdr/generate-outreach
Authorization: Bearer <token>
Content-Type: application/json

{
  "prospectId": "uuid",
  "channel": "EMAIL",
  "tone": "professional",
  "includePersonalization": true
}
```

### Qualify Prospect
```http
POST /ai-sdr/qualify
Authorization: Bearer <token>
Content-Type: application/json

{
  "prospectId": "uuid"
}
```

### Get SDR Metrics
```http
GET /ai-sdr/metrics
Authorization: Bearer <token>
```

---

## Billing

### Get Subscription
```http
GET /billing/subscription
Authorization: Bearer <token>
```

### Create Subscription
```http
POST /billing/subscription
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "PROFESSIONAL"
}
```

### Cancel Subscription
```http
POST /billing/subscription/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "atPeriodEnd": true
}
```

### Change Plan
```http
PATCH /billing/subscription/plan
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "ENTERPRISE"
}
```

### Create Checkout Session
```http
POST /billing/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "PROFESSIONAL",
  "returnUrl": "https://app.melioro.ai/settings/billing"
}
```

### Get Invoices
```http
GET /billing/invoices
Authorization: Bearer <token>
```

---

## Admin

### Get System Stats (Super Admin)
```http
GET /admin/stats
Authorization: Bearer <token>
```

### List All Organizations
```http
GET /admin/organizations?page=1&limit=20
Authorization: Bearer <token>
```

### Get Audit Logs
```http
GET /admin/audit-logs?entityType=User&page=1&limit=50
Authorization: Bearer <token>
```

### Get Feature Flags
```http
GET /admin/feature-flags
Authorization: Bearer <token>
```

### Set Feature Flag
```http
POST /admin/feature-flags
Authorization: Bearer <token>
Content-Type: application/json

{
  "key": "enable_linkedin_integration",
  "isEnabled": true,
  "description": "Enable LinkedIn integration"
}
```

---

## Rate Limiting

| Tier | Limit | Window |
|------|-------|--------|
| Free | 100 requests | 1 minute |
| Starter | 500 requests | 1 minute |
| Professional | 2000 requests | 1 minute |
| Enterprise | 10000 requests | 1 minute |

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 499
X-RateLimit-Reset: 1705312200
```

---

## Pagination

Default pagination parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

```http
GET /prospects?page=2&limit=50
```

---

## Filtering

Most list endpoints support filtering:

```http
GET /prospects?search=tech&stage=QUALIFIED&priority=HIGH&tags=enterprise,saas
```

---

## Sorting

```http
GET /prospects?sortBy=createdAt&sortOrder=desc
```

Available sort fields vary by endpoint.

---

## Webhooks

Register webhooks for real-time events:

```http
POST /webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["prospect.created", "prospect.stage_changed", "meeting.scheduled"],
  "secret": "your-webhook-secret"
}
```

### Webhook Events
- `prospect.created`
- `prospect.updated`
- `prospect.stage_changed`
- `meeting.scheduled`
- `meeting.completed`
- `campaign.started`
- `campaign.completed`
- `email.sent`
- `email.opened`
- `email.replied`