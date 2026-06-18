import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/utils/logger.service';
import { AuditLogService } from '../admin/audit-log.service';
import { EnrichmentService } from '../enrichment/enrichment.service';
import { MailService } from '../email/mail.service';
import { ResearchType, ResearchStatus, ContentType } from '@prisma/client';

export interface ProspectResearchData {
  company?: {
    name: string;
    domain: string;
    industry?: string;
    size?: string;
    location?: string;
    description?: string;
    linkedinUrl?: string;
    foundedYear?: number;
    funding?: string;
  };
  contact?: {
    firstName?: string;
    lastName?: string;
    title?: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
  };
  personalization?: {
    painPoints?: string[];
    recentNews?: string[];
    commonInterests?: string[];
    talkingPoints?: string[];
  };
}

export interface OutreachContent {
  subject: string;
  body: string;
  linkedinMessage?: string;
  followUpSequence?: string[];
}

export interface LeadQualificationResult {
  isQualified: boolean;
  score: number;
  reasons: {
    passed: string[];
    failed: string[];
  };
  recommendation: 'HOT' | 'WARM' | 'COLD' | 'NOT_A_TARGET';
}

export interface GenerateOutreachDto {
  prospectId: string;
  campaignId?: string;
  channel: 'EMAIL' | 'LINKEDIN' | 'MULTI_CHANNEL';
  templateId?: string;
  tone?: 'professional' | 'casual' | 'aggressive' | 'friendly';
}

@Injectable()
export class AISDRService {
  private readonly openaiApiKey?: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly auditLogService: AuditLogService,
    private readonly enrichmentService: EnrichmentService,
    private readonly mailService: MailService,
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
  }

  // Prospect Research
  async researchProspect(organizationId: string, userId: string, prospectId: string) {
    const prospect = await this.prisma.prospect.findFirst({
      where: { id: prospectId, organizationId },
      include: {
        company: true,
        contact: true,
      },
    });

    if (!prospect) {
      throw new NotFoundException('Prospect not found');
    }

    // Create research task
    const task = await this.prisma.researchTask.create({
      data: {
        userId,
        prospectId,
        type: 'COMPANY_RESEARCH' as ResearchType,
        status: 'PROCESSING' as ResearchStatus,
        input: {
          companyId: prospect.companyId,
          contactId: prospect.contactId,
        } as any,
      },
    });

    try {
      // Perform research
      const researchData = await this.performResearch(prospect);

      // Update task with results
      await this.prisma.researchTask.update({
        where: { id: task.id },
        data: {
          status: 'COMPLETED' as ResearchStatus,
          output: researchData as any,
          completedAt: new Date(),
        },
      });

      // Update prospect with research data
      await this.prisma.prospect.update({
        where: { id: prospectId },
        data: {
          metadata: {
            ...(prospect.metadata as object || {}),
            researchData,
            lastResearchedAt: new Date().toISOString(),
          } as any,
        },
      });

      await this.auditLogService.log({
        userId,
        organizationId,
        action: 'PROSPECT_RESEARCHED',
        entityType: 'Prospect',
        entityId: prospectId,
      });

      this.logger.log(`Prospect researched: ${prospectId}`, 'AISDR');

      return {
        taskId: task.id,
        status: 'completed',
        data: researchData,
      };
    } catch (error) {
      await this.prisma.researchTask.update({
        where: { id: task.id },
        data: {
          status: 'FAILED' as ResearchStatus,
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  private async performResearch(prospect: any): Promise<ProspectResearchData> {
    const result: ProspectResearchData = {
      company: {
        name: prospect.company.name,
        domain: prospect.company.domain || '',
        industry: prospect.company.industry,
        size: prospect.company.size,
        location: prospect.company.city || prospect.company.country,
        description: prospect.company.description,
        linkedinUrl: prospect.company.linkedinUrl,
        foundedYear: (prospect.company.metadata as any)?.foundedYear,
        funding: (prospect.company.metadata as any)?.fundingStage,
      },
      contact: {
        firstName: prospect.contact.firstName,
        lastName: prospect.contact.lastName,
        title: prospect.contact.title,
        email: prospect.contact.email,
        phone: prospect.contact.phone,
        linkedinUrl: prospect.contact.linkedinUrl,
      },
      personalization: {
        painPoints: [],
        recentNews: [],
        commonInterests: [],
        talkingPoints: [],
      },
    };

    // Add personalization based on available data
    if (prospect.company.industry) {
      result.personalization?.painPoints.push(
        `Scaling operations in the ${prospect.company.industry} industry`,
        `Managing growth in ${prospect.company.industry} sector`,
      );
    }

    if (prospect.company.linkedinUrl) {
      result.personalization?.talkingPoints.push(
        'Discussing their LinkedIn presence and thought leadership',
      );
    }

    // Enrich with additional data if available
    const companyMetadata = prospect.company.metadata as any;
    if (companyMetadata?.intentSignals?.length > 0) {
      result.personalization?.recentNews.push(
        'Recent company growth or expansion signals detected',
      );
    }

    return result;
  }

  // Personalized Outreach Generation
  async generateOutreach(
    organizationId: string,
    userId: string,
    dto: GenerateOutreachDto,
  ) {
    const prospect = await this.prisma.prospect.findFirst({
      where: { id: dto.prospectId, organizationId },
      include: {
        company: true,
        contact: true,
      },
    });

    if (!prospect) {
      throw new NotFoundException('Prospect not found');
    }

    // Create research task for personalization
    const task = await this.prisma.researchTask.create({
      data: {
        userId,
        prospectId: dto.prospectId,
        type: 'PERSONALIZATION' as ResearchType,
        status: 'PROCESSING' as ResearchStatus,
        input: { channel: dto.channel } as any,
      },
    });

    try {
      // Get or generate personalization data
      let personalization = (prospect.metadata as any)?.personalization;
      
      if (!personalization) {
        const researchResult = await this.performResearch(prospect);
        personalization = researchResult.personalization;
      }

      // Generate outreach content
      const content = await this.generateOutreachContent(
        prospect,
        personalization,
        dto.tone || 'professional',
        dto.channel,
      );

      // Store generated content
      const contentPromises = [];

      if (content.subject) {
        contentPromises.push(
          this.prisma.generatedContent.create({
            data: {
              userId,
              prospectId: dto.prospectId,
              type: 'EMAIL_SUBJECT' as ContentType,
              content: content.subject,
              metadata: { campaignId: dto.campaignId, tone: dto.tone } as any,
            },
          }),
        );
      }

      if (content.body) {
        contentPromises.push(
          this.prisma.generatedContent.create({
            data: {
              userId,
              prospectId: dto.prospectId,
              type: 'EMAIL_BODY' as ContentType,
              content: content.body,
              metadata: { campaignId: dto.campaignId, tone: dto.tone } as any,
            },
          }),
        );
      }

      if (content.linkedinMessage) {
        contentPromises.push(
          this.prisma.generatedContent.create({
            data: {
              userId,
              prospectId: dto.prospectId,
              type: 'LINKEDIN_MESSAGE' as ContentType,
              content: content.linkedinMessage,
              metadata: { campaignId: dto.campaignId, tone: dto.tone } as any,
            },
          }),
        );
      }

      const savedContent = await Promise.all(contentPromises);

      // Update task
      await this.prisma.researchTask.update({
        where: { id: task.id },
        data: {
          status: 'COMPLETED' as ResearchStatus,
          output: content as any,
          completedAt: new Date(),
        },
      });

      await this.auditLogService.log({
        userId,
        organizationId,
        action: 'OUTREACH_GENERATED',
        entityType: 'Prospect',
        entityId: dto.prospectId,
      });

      this.logger.log(`Outreach generated for prospect: ${dto.prospectId}`, 'AISDR');

      return {
        taskId: task.id,
        content: {
          subject: content.subject,
          body: content.body,
          linkedinMessage: content.linkedinMessage,
          followUpSequence: content.followUpSequence,
        },
        savedContentIds: savedContent.map((c) => c.id),
      };
    } catch (error) {
      await this.prisma.researchTask.update({
        where: { id: task.id },
        data: {
          status: 'FAILED' as ResearchStatus,
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  private async generateOutreachContent(
    prospect: any,
    personalization: any,
    tone: string,
    channel: 'EMAIL' | 'LINKEDIN' | 'MULTI_CHANNEL',
  ): Promise<OutreachContent> {
    const contact = prospect.contact;
    const company = prospect.company;
    const firstName = contact.firstName || 'there';

    // Generate subject line
    const subjects = [
      `Quick question about ${company.name}`,
      `Thought on ${company.industry || 'your industry'}`,
      `${company.name} + a quick chat?`,
      `Ideas for ${company.name}`,
    ];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];

    // Generate email body
    const body = `
Hi ${firstName},

I came across ${company.name} and was impressed by ${personalization?.recentNews?.[0] || 'what you\'re building'}.

I work with companies like yours to ${personalization?.painPoints?.[0] || 'help streamline their outreach processes'}. 

Would you be open to a quick 15-minute call this week to see if there's a fit?

Best,
    `.trim();

    // Generate LinkedIn message
    const linkedinMessage = `
Hi ${firstName}!

I noticed ${company.name} and thought your work in ${company.industry || 'your space'} was interesting.

I'd love to connect and share some ideas that might help with ${personalization?.painPoints?.[0] || 'growth initiatives'}.

Open to a quick chat?
    `.trim();

    // Generate follow-up sequence
    const followUpSequence = [
      `Hi ${firstName}, just following up on my previous message. Would love to chat when you have a moment.`,
      `Hi ${firstName}, I know you're busy - just wanted to make sure you saw my note. Happy to work around your schedule.`,
      `Hi ${firstName}, I'll leave you alone after this one. But if you ever want to chat, I'm here!`,
    ];

    return {
      subject,
      body,
      linkedinMessage: channel !== 'EMAIL' ? linkedinMessage : undefined,
      followUpSequence,
    };
  }

  // Lead Qualification
  async qualifyLead(organizationId: string, userId: string, prospectId: string): Promise<LeadQualificationResult> {
    const prospect = await this.prisma.prospect.findFirst({
      where: { id: prospectId, organizationId },
      include: {
        company: true,
        contact: true,
      },
    });

    if (!prospect) {
      throw new NotFoundException('Prospect not found');
    }

    const passed: string[] = [];
    const failed: string[] = [];
    let score = 0;

    // Check company size
    const companySize = prospect.company.size;
    if (companySize && this.isValidCompanySize(companySize)) {
      passed.push('Company size is within target range');
      score += 20;
    } else if (companySize) {
      failed.push('Company size outside target range');
    }

    // Check industry
    if (prospect.company.industry) {
      passed.push('Industry is identified');
      score += 15;
    }

    // Check contact information
    if (prospect.contact.email) {
      passed.push('Contact email available');
      score += 15;
    } else {
      failed.push('No contact email available');
    }

    if (prospect.contact.title) {
      passed.push('Contact title identified');
      score += 10;
    }

    // Check engagement
    const recentActivity = await this.prisma.activity.count({
      where: {
        prospectId,
        createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
    });

    if (recentActivity > 0) {
      passed.push('Recent engagement activity');
      score += 20;
    }

    // Check intent signals
    const metadata = prospect.metadata as any;
    const intentSignals = metadata?.intentSignals || [];
    if (intentSignals.length > 0) {
      const highIntentSignals = intentSignals.filter((s: any) => s.confidence > 70);
      if (highIntentSignals.length > 0) {
        passed.push('High-intent signals detected');
        score += 20;
      }
    }

    // Check company data completeness
    const companyFields = [prospect.company.industry, prospect.company.size, prospect.company.city, prospect.company.country];
    const filledFields = companyFields.filter(Boolean).length;
    score += filledFields * 5;

    // Determine qualification
    const isQualified = score >= 60;
    let recommendation: LeadQualificationResult['recommendation'];

    if (score >= 80) {
      recommendation = 'HOT';
    } else if (score >= 60) {
      recommendation = 'WARM';
    } else if (score >= 40) {
      recommendation = 'COLD';
    } else {
      recommendation = 'NOT_A_TARGET';
    }

    // Update prospect with qualification
    await this.prisma.prospect.update({
      where: { id: prospectId },
      data: {
        metadata: {
          ...(prospect.metadata as object || {}),
          qualification: {
            score,
            recommendation,
            qualifiedAt: new Date().toISOString(),
          },
        } as any,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'LEAD_QUALIFIED',
      entityType: 'Prospect',
      entityId: prospectId,
      newData: { score, recommendation },
    });

    return {
      isQualified,
      score,
      reasons: { passed, failed },
      recommendation,
    };
  }

  private isValidCompanySize(size: string): boolean {
    const validSizes = ['1-10', '11-50', '51-200', '201-500', '501-1000'];
    return validSizes.includes(size);
  }

  // Follow-up Automation
  async scheduleFollowUp(
    organizationId: string,
    userId: string,
    prospectId: string,
    sequenceId: string,
    delayDays: number = 3,
  ) {
    const prospect = await this.prisma.prospect.findFirst({
      where: { id: prospectId, organizationId },
    });

    if (!prospect) {
      throw new NotFoundException('Prospect not found');
    }

    const scheduledAt = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);

    // Find next step in sequence
    const sequence = await this.prisma.sequence.findUnique({
      where: { id: sequenceId },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
        prospectSequences: {
          where: { prospectId },
        },
      },
    });

    if (!sequence) {
      throw new NotFoundException('Sequence not found');
    }

    // Find current step
    const currentStep = sequence.prospectSequences[0];
    const currentStepNumber = currentStep?.currentStep || 0;
    const nextStep = sequence.steps.find((s) => s.stepNumber === currentStepNumber + 1);

    if (!nextStep) {
      // Sequence complete
      await this.prisma.prospectSequence.update({
        where: { id: currentStep?.id },
        data: { status: 'COMPLETED' as any },
      });

      return { message: 'Sequence completed', nextStep: null };
    }

    // Schedule next step
    const followUpStep = await this.prisma.sequenceStep.update({
      where: { id: nextStep.id },
      data: {
        scheduledAt,
      },
    });

    // Update prospect sequence progress
    if (currentStep) {
      await this.prisma.prospectSequence.update({
        where: { id: currentStep.id },
        data: {
          currentStep: nextStep.stepNumber,
          lastActionAt: new Date(),
        },
      });
    }

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'FOLLOW_UP_SCHEDULED',
      entityType: 'SequenceStep',
      entityId: nextStep.id,
      newData: { prospectId, scheduledAt: scheduledAt.toISOString() },
    });

    this.logger.log(`Follow-up scheduled for prospect ${prospectId}: step ${nextStep.stepNumber}`, 'AISDR');

    return {
      message: 'Follow-up scheduled',
      nextStep: {
        stepId: nextStep.id,
        stepNumber: nextStep.stepNumber,
        type: nextStep.type,
        scheduledAt,
      },
    };
  }

  // Bulk Operations
  async bulkResearch(organizationId: string, userId: string, prospectIds: string[]) {
    const results = await Promise.allSettled(
      prospectIds.map((prospectId) =>
        this.researchProspect(organizationId, userId, prospectId),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'BULK_RESEARCH_COMPLETED',
      entityType: 'Prospect',
      newData: { total: prospectIds.length, succeeded, failed },
    });

    return {
      total: prospectIds.length,
      succeeded,
      failed,
      results: results.map((r, i) => ({
        prospectId: prospectIds[i],
        status: r.status,
        error: r.status === 'rejected' ? (r as PromiseRejectedResult).reason.message : undefined,
      })),
    };
  }

  async bulkQualify(organizationId: string, userId: string, prospectIds: string[]) {
    const results = await Promise.allSettled(
      prospectIds.map((prospectId) =>
        this.qualifyLead(organizationId, userId, prospectId),
      ),
    );

    const qualified = results.filter(
      (r) => r.status === 'fulfilled' && (r as PromiseFulfilledResult<LeadQualificationResult>).value.isQualified,
    ).length;

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'BULK_QUALIFICATION_COMPLETED',
      entityType: 'Prospect',
      newData: { total: prospectIds.length, qualified },
    });

    return {
      total: prospectIds.length,
      qualified,
      unqualified: prospectIds.length - qualified,
      results: results.map((r, i) => ({
        prospectId: prospectIds[i],
        status: r.status,
        result: r.status === 'fulfilled' ? (r as PromiseFulfilledResult<LeadQualificationResult>).value : undefined,
      })),
    };
  }

  // Analytics
  async getSDRMetrics(organizationId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalProspects,
      qualifiedProspects,
      hotProspects,
      warmProspects,
      recentResearch,
      recentOutreach,
    ] = await Promise.all([
      this.prisma.prospect.count({ where: { organizationId } }),
      this.prisma.prospect.count({
        where: {
          organizationId,
          metadata: { path: ['qualification', 'score'], gte: 60 },
        },
      }),
      this.prisma.prospect.count({
        where: {
          organizationId,
          metadata: { path: ['qualification', 'recommendation'], equals: 'HOT' },
        },
      }),
      this.prisma.prospect.count({
        where: {
          organizationId,
          metadata: { path: ['qualification', 'recommendation'], equals: 'WARM' },
        },
      }),
      this.prisma.researchTask.count({
        where: {
          user: { organizationId },
          type: 'COMPANY_RESEARCH',
          status: 'COMPLETED',
          completedAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.generatedContent.count({
        where: {
          user: { organizationId },
          type: { in: ['EMAIL_BODY', 'LINKEDIN_MESSAGE'] },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    return {
      prospects: {
        total: totalProspects,
        qualified: qualifiedProspects,
        hot: hotProspects,
        warm: warmProspects,
        qualificationRate: totalProspects > 0 ? Math.round((qualifiedProspects / totalProspects) * 100) : 0,
      },
      activity: {
        researchCompleted: recentResearch,
        outreachGenerated: recentOutreach,
      },
    };
  }

  // A/B Testing for Outreach
  async createOutreachVariants(
    organizationId: string,
    userId: string,
    prospectId: string,
    variantCount: number = 2,
  ) {
    const tones = ['professional', 'casual', 'friendly'];
    const variants = [];

    for (let i = 0; i < Math.min(variantCount, tones.length); i++) {
      const result = await this.generateOutreach(organizationId, userId, {
        prospectId,
        channel: 'EMAIL',
        tone: tones[i] as any,
      });

      variants.push({
        tone: tones[i],
        ...result.content,
        variantId: result.savedContentIds[0],
      });
    }

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'OUTREACH_VARIANTS_CREATED',
      entityType: 'Prospect',
      entityId: prospectId,
      newData: { count: variants.length },
    });

    return {
      prospectId,
      variants,
    };
  }

  // Track variant performance
  async trackVariantPerformance(
    organizationId: string,
    contentId: string,
  ) {
    const content = await this.prisma.generatedContent.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    const metadata = content.metadata as any;
    const variantIndex = metadata?.variantIndex || 0;

    // Count opens/replies for this variant
    const activities = await this.prisma.activity.findMany({
      where: {
        prospectId: content.prospectId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        type: { in: ['EMAIL_OPENED', 'EMAIL_REPLIED'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    const opens = activities.filter((a) => a.type === 'EMAIL_OPENED').length;
    const replies = activities.filter((a) => a.type === 'EMAIL_REPLIED').length;

    return {
      variantId: contentId,
      tone: metadata?.tone,
      opens,
      replies,
      openRate: opens > 0 ? Math.round((replies / opens) * 100) : 0,
    };
  }
}
