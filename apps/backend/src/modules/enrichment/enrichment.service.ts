import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/utils/logger.service';
import { AuditLogService } from '../admin/audit-log.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { EnrichmentType, JobStatus } from '@prisma/client';

export type EnrichmentProvider = 'CLEARBIT' | 'APOLLO' | 'HUNTER' | 'Snov';

export interface EnrichmentJobFilters {
  status?: JobStatus;
  provider?: string;
  page?: number;
  limit?: number;
}

export interface CompanyEnrichmentData {
  domain: string;
  name?: string;
  industry?: string;
  size?: string;
  location?: string;
  foundedYear?: number;
  logo?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  metrics?: {
    annualRevenue?: number;
    raised?: number;
    employees?: number;
  };
}

export interface ContactEnrichmentData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  location?: string;
  company?: string;
  companyDomain?: string;
}

@Injectable()
export class EnrichmentService {
  private readonly clearbitApiKey?: string;
  private readonly apolloApiKey?: string;
  private readonly hunterApiKey?: string;
  private readonly snovApiKey?: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly auditLogService: AuditLogService,
    private readonly webhooksService: WebhooksService,
  ) {
    this.clearbitApiKey = this.configService.get<string>('CLEARBIT_API_KEY');
    this.apolloApiKey = this.configService.get<string>('APOLLO_API_KEY');
    this.hunterApiKey = this.configService.get<string>('HUNTER_API_KEY');
    this.snovApiKey = this.configService.get<string>('SNOV_API_KEY');
  }

  async createCompanyEnrichmentJob(
    organizationId: string,
    userId: string,
    companyId: string,
    domain: string,
    provider: EnrichmentProvider = 'CLEARBIT',
    priority: number = 0,
  ) {
    const job = await this.prisma.enrichmentJob.create({
      data: {
        organizationId,
        userId,
        companyId,
        provider,
        type: 'COMPANY_ENRICH' as EnrichmentType,
        status: 'PENDING' as JobStatus,
        priority,
        input: { domain } as any,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'ENRICHMENT_JOB_CREATED',
      entityType: 'EnrichmentJob',
      entityId: job.id,
      newData: { type: 'COMPANY_ENRICH', provider, companyId },
    });

    this.logger.log(`Company enrichment job created: ${job.id}`, 'Enrichment');

    // Process immediately if priority is high
    if (priority > 5) {
      this.processJob(job.id);
    }

    return job;
  }

  async createContactEnrichmentJob(
    organizationId: string,
    userId: string,
    contactId: string,
    email: string,
    provider: EnrichmentProvider = 'APOLLO',
    priority: number = 0,
  ) {
    const job = await this.prisma.enrichmentJob.create({
      data: {
        organizationId,
        userId,
        contactId,
        provider,
        type: 'CONTACT_ENRICH' as EnrichmentType,
        status: 'PENDING' as JobStatus,
        priority,
        input: { email } as any,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'ENRICHMENT_JOB_CREATED',
      entityType: 'EnrichmentJob',
      entityId: job.id,
      newData: { type: 'CONTACT_ENRICH', provider, contactId },
    });

    this.logger.log(`Contact enrichment job created: ${job.id}`, 'Enrichment');

    return job;
  }

  async createEmailVerificationJob(
    organizationId: string,
    userId: string,
    email: string,
    priority: number = 0,
  ) {
    const job = await this.prisma.enrichmentJob.create({
      data: {
        organizationId,
        userId,
        provider: 'HUNTER',
        type: 'EMAIL_VERIFY' as EnrichmentType,
        status: 'PENDING' as JobStatus,
        priority,
        input: { email } as any,
      },
    });

    this.logger.log(`Email verification job created: ${job.id}`, 'Enrichment');

    return job;
  }

  async createSocialLookupJob(
    organizationId: string,
    userId: string,
    contactId: string,
    firstName: string,
    lastName: string,
    companyDomain: string,
    priority: number = 0,
  ) {
    const job = await this.prisma.enrichmentJob.create({
      data: {
        organizationId,
        userId,
        contactId,
        provider: 'APOLLO',
        type: 'SOCIAL_LOOKUP' as EnrichmentType,
        status: 'PENDING' as JobStatus,
        priority,
        input: { firstName, lastName, companyDomain } as any,
      },
    });

    this.logger.log(`Social lookup job created: ${job.id}`, 'Enrichment');

    return job;
  }

  async getJob(id: string) {
    const job = await this.prisma.enrichmentJob.findUnique({
      where: { id },
      include: {
        company: true,
        contact: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Enrichment job not found');
    }

    return job;
  }

  async listJobs(organizationId: string, filters: EnrichmentJobFilters) {
    const { status, provider, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (status) where.status = status;
    if (provider) where.provider = provider;

    const [jobs, total] = await Promise.all([
      this.prisma.enrichmentJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        include: {
          company: { select: { id: true, name: true, domain: true } },
          contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.enrichmentJob.count({ where }),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async cancelJob(organizationId: string, userId: string, id: string) {
    const job = await this.prisma.enrichmentJob.findFirst({
      where: { id, organizationId },
    });

    if (!job) {
      throw new NotFoundException('Enrichment job not found');
    }

    if (job.status === 'COMPLETED' || job.status === 'PROCESSING') {
      throw new Error('Cannot cancel a job that is already completed or processing');
    }

    const updatedJob = await this.prisma.enrichmentJob.update({
      where: { id },
      data: { status: 'CANCELLED' as JobStatus },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'ENRICHMENT_JOB_CANCELLED',
      entityType: 'EnrichmentJob',
      entityId: id,
    });

    this.logger.log(`Enrichment job cancelled: ${id}`, 'Enrichment');

    return updatedJob;
  }

  async processJob(id: string) {
    const job = await this.prisma.enrichmentJob.findUnique({
      where: { id },
    });

    if (!job || job.status !== 'PENDING') {
      return;
    }

    await this.prisma.enrichmentJob.update({
      where: { id },
      data: {
        status: 'PROCESSING' as JobStatus,
        startedAt: new Date(),
        attempts: job.attempts + 1,
      },
    });

    try {
      let result: any;

      switch (job.type) {
        case 'COMPANY_ENRICH':
          result = await this.enrichCompany(job);
          break;
        case 'CONTACT_ENRICH':
          result = await this.enrichContact(job);
          break;
        case 'EMAIL_VERIFY':
          result = await this.verifyEmail(job);
          break;
        case 'SOCIAL_LOOKUP':
          result = await this.socialLookup(job);
          break;
        default:
          throw new Error(`Unknown enrichment type: ${job.type}`);
      }

      // Update job with result
      await this.prisma.enrichmentJob.update({
        where: { id },
        data: {
          status: 'COMPLETED' as JobStatus,
          output: result as any,
          completedAt: new Date(),
        },
      });

      // Dispatch webhook
      const webhookEvent = job.type === 'COMPANY_ENRICH' 
        ? 'enrichment.company_completed'
        : 'enrichment.contact_completed';

      await this.webhooksService.dispatch(webhookEvent, {
        jobId: job.id,
        type: job.type,
        companyId: job.companyId,
        contactId: job.contactId,
        result,
      }, job.organizationId);

      this.logger.log(`Enrichment job completed: ${id}`, 'Enrichment');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (job.attempts + 1 >= job.maxAttempts) {
        await this.prisma.enrichmentJob.update({
          where: { id },
          data: {
            status: 'FAILED' as JobStatus,
            error: errorMessage,
            completedAt: new Date(),
          },
        });
      } else {
        // Reschedule for retry
        await this.prisma.enrichmentJob.update({
          where: { id },
          data: {
            status: 'PENDING' as JobStatus,
            error: errorMessage,
            scheduledAt: new Date(Date.now() + 60000), // 1 minute delay
          },
        });
      }

      this.logger.error(`Enrichment job failed: ${id}`, errorMessage, 'Enrichment');
    }
  }

  private async enrichCompany(job: any): Promise<CompanyEnrichmentData> {
    const input = job.input as { domain: string };

    switch (job.provider) {
      case 'CLEARBIT':
        return this.clearbitCompanyEnrichment(input.domain);
      case 'APOLLO':
        return this.apolloCompanyEnrichment(input.domain);
      default:
        return this.clearbitCompanyEnrichment(input.domain);
    }
  }

  private async enrichContact(job: any): Promise<ContactEnrichmentData> {
    const input = job.input as { email: string };

    switch (job.provider) {
      case 'APOLLO':
        return this.apolloContactEnrichment(input.email);
      case 'CLEARBIT':
        return this.clearbitContactEnrichment(input.email);
      default:
        return this.apolloContactEnrichment(input.email);
    }
  }

  private async verifyEmail(job: any): Promise<{ email: string; valid: boolean; score: number }> {
    const input = job.input as { email: string };

    if (!this.hunterApiKey) {
      // Fallback - just mark as valid
      return { email: input.email, valid: true, score: 100 };
    }

    try {
      const response = await fetch(
        `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(input.email)}&api_key=${this.hunterApiKey}`,
      );

      if (!response.ok) {
        throw new Error('Hunter API request failed');
      }

      const data = await response.json() as any;
      const result = data.data;

      return {
        email: input.email,
        valid: result.result === 'deliverable',
        score: result.score || 0,
      };
    } catch (error) {
      this.logger.error('Email verification failed', error instanceof Error ? error.message : '', 'Enrichment');
      return { email: input.email, valid: true, score: 50 };
    }
  }

  private async socialLookup(job: any): Promise<{ linkedin?: string; twitter?: string }> {
    const input = job.input as { firstName: string; lastName: string; companyDomain: string };

    if (!this.apolloApiKey) {
      return {};
    }

    try {
      const response = await fetch('https://api.apollo.io/v1/contacts/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apolloApiKey}`,
        },
        body: JSON.stringify({
          page_size: 1,
          q_keywords: `${input.firstName} ${input.lastName} ${input.companyDomain}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Apollo API request failed');
      }

      const data = await response.json() as any;
      const contact = data.contacts?.[0];

      if (contact) {
        return {
          linkedin: contact.linkedin_url,
          twitter: contact.twitter_url,
        };
      }

      return {};
    } catch (error) {
      this.logger.error('Social lookup failed', error instanceof Error ? error.message : '', 'Enrichment');
      return {};
    }
  }

  private async clearbitCompanyEnrichment(domain: string): Promise<CompanyEnrichmentData> {
    if (!this.clearbitApiKey) {
      return { domain };
    }

    try {
      const response = await fetch(`https://company.clearbit.com/v2/companies/find?domain=${domain}`, {
        headers: {
          'Authorization': `Bearer ${this.clearbitApiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Clearbit API request failed');
      }

      const data = await response.json() as any;

      return {
        domain,
        name: data.name,
        industry: data.category?.industry,
        size: data.metrics?.employees,
        location: data.location,
        foundedYear: data.foundedYear,
        logo: data.logo,
        linkedinUrl: data.linkedin?.handle,
        twitterUrl: data.twitter?.handle,
        facebookUrl: data.facebook?.handle,
        metrics: {
          annualRevenue: data.metrics?.annualRevenue,
          raised: data.metrics?.raised,
          employees: data.metrics?.employees,
        },
      };
    } catch (error) {
      this.logger.error(`Clearbit enrichment failed for ${domain}`, error instanceof Error ? error.message : '', 'Enrichment');
      return { domain };
    }
  }

  private async apolloCompanyEnrichment(domain: string): Promise<CompanyEnrichmentData> {
    if (!this.apolloApiKey) {
      return { domain };
    }

    try {
      const response = await fetch(`https://api.apollo.io/v1/organizations/enrich?domain=${domain}`, {
        headers: {
          'Authorization': `Bearer ${this.apolloApiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Apollo API request failed');
      }

      const data = await response.json() as any;
      const org = data.organization;

      if (org) {
        return {
          domain,
          name: org.name,
          industry: org.industry,
          size: org.employee_range,
          location: org.location,
          linkedinUrl: org.linkedin_url,
          twitterUrl: org.twitter_url,
          metrics: {
            employees: org.employees_count,
          },
        };
      }

      return { domain };
    } catch (error) {
      this.logger.error(`Apollo enrichment failed for ${domain}`, error instanceof Error ? error.message : '', 'Enrichment');
      return { domain };
    }
  }

  private async clearbitContactEnrichment(email: string): Promise<ContactEnrichmentData> {
    if (!this.clearbitApiKey) {
      return { email };
    }

    try {
      const response = await fetch(`https://person.clearbit.com/v2/combined/find?email=${email}`, {
        headers: {
          'Authorization': `Bearer ${this.clearbitApiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Clearbit API request failed');
      }

      const data = await response.json() as any;

      return {
        firstName: data.person?.name?.givenName,
        lastName: data.person?.name?.familyName,
        email,
        phone: data.person?.phone,
        title: data.person?.employment?.title,
        linkedinUrl: data.person?.linkedin?.handle,
        twitterUrl: data.person?.twitter?.handle,
        location: data.person?.location,
        company: data.company?.name,
        companyDomain: data.company?.domain,
      };
    } catch (error) {
      this.logger.error(`Clearbit contact enrichment failed for ${email}`, error instanceof Error ? error.message : '', 'Enrichment');
      return { email };
    }
  }

  private async apolloContactEnrichment(email: string): Promise<ContactEnrichmentData> {
    if (!this.apolloApiKey) {
      return { email };
    }

    try {
      const response = await fetch('https://api.apollo.io/v1/contacts/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apolloApiKey}`,
        },
        body: JSON.stringify({
          page_size: 1,
          q_keywords: email,
        }),
      });

      if (!response.ok) {
        throw new Error('Apollo API request failed');
      }

      const data = await response.json() as any;
      const contact = data.contacts?.[0];

      if (contact) {
        return {
          firstName: contact.first_name,
          lastName: contact.last_name,
          email,
          phone: contact.phone_number,
          title: contact.title,
          linkedinUrl: contact.linkedin_url,
          twitterUrl: contact.twitter_url,
          location: contact.location,
          company: contact.organization?.name,
          companyDomain: contact.organization?.domain,
        };
      }

      return { email };
    } catch (error) {
      this.logger.error(`Apollo contact enrichment failed for ${email}`, error instanceof Error ? error.message : '', 'Enrichment');
      return { email };
    }
  }

  async getAvailableProviders() {
    return {
      CLEARBIT: !!this.clearbitApiKey,
      APOLLO: !!this.apolloApiKey,
      HUNTER: !!this.hunterApiKey,
      Snov: !!this.snovApiKey,
    };
  }

  async bulkEnrichContacts(
    organizationId: string,
    userId: string,
    contacts: { contactId: string; email: string }[],
    provider: EnrichmentProvider = 'APOLLO',
  ) {
    const jobs = await Promise.all(
      contacts.map((contact) =>
        this.createContactEnrichmentJob(
          organizationId,
          userId,
          contact.contactId,
          contact.email,
          provider,
        ),
      ),
    );

    this.logger.log(`Bulk enrichment created ${jobs.length} jobs`, 'Enrichment');

    return {
      created: jobs.length,
      jobs,
    };
  }

  async bulkEnrichCompanies(
    organizationId: string,
    userId: string,
    companies: { companyId: string; domain: string }[],
    provider: EnrichmentProvider = 'CLEARBIT',
  ) {
    const jobs = await Promise.all(
      companies.map((company) =>
        this.createCompanyEnrichmentJob(
          organizationId,
          userId,
          company.companyId,
          company.domain,
          provider,
        ),
      ),
    );

    this.logger.log(`Bulk company enrichment created ${jobs.length} jobs`, 'Enrichment');

    return {
      created: jobs.length,
      jobs,
    };
  }

  async getJobStats(organizationId: string) {
    const [total, pending, processing, completed, failed] = await Promise.all([
      this.prisma.enrichmentJob.count({ where: { organizationId } }),
      this.prisma.enrichmentJob.count({ where: { organizationId, status: 'PENDING' } }),
      this.prisma.enrichmentJob.count({ where: { organizationId, status: 'PROCESSING' } }),
      this.prisma.enrichmentJob.count({ where: { organizationId, status: 'COMPLETED' } }),
      this.prisma.enrichmentJob.count({ where: { organizationId, status: 'FAILED' } }),
    ]);

    return {
      total,
      pending,
      processing,
      completed,
      failed,
    };
  }
}
