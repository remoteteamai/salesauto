# Database Schema Documentation

## Overview

Melioro AI uses PostgreSQL as its primary database with Prisma ORM for type-safe database access. The schema is designed for multi-tenant SaaS architecture with proper data isolation.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ORGANIZATION                                        │
│  ┌─────────────┐  ┌───────────┐  ┌────────────┐  ┌─────────────┐               │
│  │    User     │  │    Team   │  │Subscription│  │   Billing   │               │
│  └──────┬──────┘  └─────┬─────┘  └──────┬─────┘  └──────┬──────┘               │
│         │               │                │               │                      │
└─────────┼───────────────┼────────────────┼───────────────┼──────────────────────┘
          │               │                │               │
          │               │                │               │
    ┌─────┴─────┐    ┌────┴────┐     ┌─────┴─────┐   ┌────┴────┐
    │TeamMember │    │  User   │     │  Invoice  │   │UsageRec │
    └───────────┘    └─────────┘     └───────────┘   └─────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Session    │
                    └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PROSPECT MODULE                                     │
│                                                                                   │
│   ┌──────────┐      ┌─────────────┐      ┌──────────┐                           │
│   │ Company  │──────│   Prospect  │──────│ Contact  │                           │
│   └──────────┘      └──────┬──────┘      └──────────┘                           │
│                            │                                                      │
│                     ┌──────┴──────┐                                              │
│                     │  Sequence   │                                              │
│                     └──────┬──────┘                                              │
│                            │                                                      │
│                     ┌──────┴──────┐                                              │
│                     │ProspectSeq  │                                              │
│                     └─────────────┘                                              │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CAMPAIGN MODULE                                      │
│                                                                                   │
│   ┌──────────┐      ┌─────────────┐      ┌──────────┐      ┌─────────────┐      │
│   │ Campaign │──────│  Sequence   │──────│Seq Step  │      │    Email    │      │
│   └──────────┘      └─────────────┘      └──────────┘      └─────────────┘      │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ANALYTICS MODULE                                     │
│                                                                                   │
│   ┌──────────────────┐      ┌────────────────┐      ┌─────────────────────┐      │
│   │ AnalyticsEvent   │      │DashboardMetric │      │      Meeting        │      │
│   └──────────────────┘      └────────────────┘      └─────────────────────┘      │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Core Entities

### Organization
The root entity for multi-tenancy. Each organization has isolated data.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Organization name |
| slug | String | URL-friendly identifier (unique) |
| logo | String | Logo URL |
| settings | JSON | Custom settings |
| trialEndsAt | DateTime | Trial period end |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update |

### User
User accounts with authentication and organization membership.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique email |
| passwordHash | String | Bcrypt hashed password |
| firstName | String | First name |
| lastName | String | Last name |
| avatar | String | Avatar URL |
| isActive | Boolean | Account status |
| isSuperAdmin | Boolean | Admin flag |
| lastLoginAt | DateTime | Last login |
| organizationId | UUID | FK to Organization |

### Subscription
Billing subscriptions with Stripe integration.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organizationId | UUID | FK to Organization |
| stripeSubscriptionId | String | Stripe subscription ID |
| plan | Enum | STARTER, PROFESSIONAL, ENTERPRISE |
| status | Enum | ACTIVE, PAST_DUE, CANCELED, TRIALING |
| currentPeriodStart | DateTime | Period start |
| currentPeriodEnd | DateTime | Period end |

### Prospect
Lead/prospect records linking companies and contacts.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organizationId | UUID | FK to Organization |
| companyId | UUID | FK to Company |
| contactId | UUID | FK to Contact |
| stage | Enum | NEW, CONTACTED, ENGAGED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST |
| status | Enum | ACTIVE, ARCHIVED, CONVERTED |
| priority | Enum | LOW, MEDIUM, HIGH, CRITICAL |
| score | Float | ICP matching score (0-100) |
| ownerId | UUID | FK to User (sales rep) |
| tags | String[] | Custom tags |
| intentSignals | JSON | Detected intent data |

### Company
Company records with enrichment data.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organizationId | UUID | FK to Organization |
| name | String | Company name |
| domain | String | Company website |
| industry | String | Industry classification |
| employeeCount | Int | Employee count |
| annualRevenue | BigInt | Annual revenue |
| funding | JSON | Funding rounds |
| technologies | String[] | Tech stack |
| intentSignals | JSON | Hiring/funding/tech signals |
| icpScore | Float | Ideal customer profile match |
| icpMatched | Boolean | Passes ICP filter |

### Contact
Individual contacts within companies.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| companyId | UUID | FK to Company |
| firstName | String | First name |
| lastName | String | Last name |
| email | String | Email address |
| phone | String | Phone number |
| jobTitle | String | Job title |
| seniority | String | EXECUTIVE, DIRECTOR, MANAGER, IC |
| linkedinUrl | String | LinkedIn profile |
| score | Float | Contact quality score |
| isVerified | Boolean | Email verified |

### Campaign
Marketing/sales campaigns.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organizationId | UUID | FK to Organization |
| name | String | Campaign name |
| type | Enum | EMAIL, LINKEDIN, MULTI_CHANNEL, OUTBOUND |
| status | Enum | DRAFT, SCHEDULED, ACTIVE, PAUSED, COMPLETED |
| ownerId | UUID | FK to User |
| startDate | DateTime | Campaign start |
| endDate | DateTime | Campaign end |
| budget | Int | Budget in cents |
| stats | JSON | Campaign metrics |

### Sequence
Multi-step outreach sequences.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| campaignId | UUID | FK to Campaign |
| name | String | Sequence name |
| steps | SequenceStep[] | Sequence steps |
| stats | JSON | Engagement metrics |

### SequenceStep
Individual steps within a sequence.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| sequenceId | UUID | FK to Sequence |
| stepOrder | Int | Order in sequence |
| type | Enum | EMAIL, LINKEDIN_MESSAGE, LINKEDIN_CONNECT, TASK, DELAY |
| channel | Enum | EMAIL, LINKEDIN, TASK |
| subject | String | Email subject |
| bodyTemplate | String | Message template |
| delayDays | Int | Days to wait |
| delayHours | Int | Additional hours |

### AuditLog
Immutable audit trail for compliance.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | FK to User |
| organizationId | UUID | FK to Organization |
| action | String | Action performed |
| entityType | String | Entity type |
| entityId | UUID | Entity ID |
| oldData | JSON | Previous values |
| newData | JSON | New values |
| ipAddress | String | Client IP |
| createdAt | DateTime | Timestamp |

## Indexes

### Primary Indexes
- All tables have UUID primary keys

### Foreign Key Indexes
- `User.organizationId` → Organization
- `Prospect.organizationId` → Organization
- `Prospect.companyId` → Company
- `Prospect.contactId` → Contact
- `AuditLog.organizationId` → Organization

### Query Indexes
```sql
-- User lookups
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_organization ON User(organizationId);

-- Prospect queries
CREATE INDEX idx_prospect_organization ON Prospect(organizationId);
CREATE INDEX idx_prospect_stage ON Prospect(stage);
CREATE INDEX idx_prospect_status ON Prospect(status);
CREATE INDEX idx_prospect_owner ON Prospect(ownerId);

-- Company queries
CREATE INDEX idx_company_domain ON Company(domain);
CREATE INDEX idx_company_icp_matched ON Company(icpMatched);

-- Audit log queries
CREATE INDEX idx_audit_entity ON AuditLog(entityType, entityId);
CREATE INDEX idx_audit_created ON AuditLog(createdAt);
```

## Data Isolation

All tenant-scoped queries include `organizationId` in the WHERE clause:

```typescript
// Example: Get prospects for an organization
const prospects = await prisma.prospect.findMany({
  where: {
    organizationId: ctx.user.organizationId,
    status: 'ACTIVE'
  }
});
```

## Soft Deletes

Users and other entities use soft deletes for data recovery:

```typescript
await prisma.user.update({
  where: { id: userId },
  data: { deletedAt: new Date() }
});
```

Query patterns should filter deleted records:
```typescript
where: { deletedAt: null }
```

## Migrations

```bash
# Generate migration
npm run db:migrate

# Push schema changes (development)
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed database
npm run db:seed
```