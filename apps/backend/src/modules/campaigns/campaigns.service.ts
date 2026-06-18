import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/utils/logger.service';
import { AuditLogService } from '../admin/audit-log.service';
import { CampaignType, CampaignStatus } from '@prisma/client';

export interface CreateCampaignDto {
  name: string;
  type: CampaignType;
  description?: string;
  targetAudience?: any;
  settings?: any;
}

export interface UpdateCampaignDto {
  name?: string;
  description?: string;
  targetAudience?: any;
  settings?: any;
  status?: CampaignStatus;
}

export interface CampaignFilters {
  search?: string;
  type?: CampaignType;
  status?: CampaignStatus;
  page?: number;
  limit?: number;
}

export interface SequenceStep {
  stepNumber: number;
  type: 'EMAIL' | 'LINKEDIN' | 'WAIT';
  template?: string;
  delayDays?: number;
  subject?: string;
}

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(organizationId: string, userId: string, dto: CreateCampaignDto) {
    const campaign = await this.prisma.campaign.create({
      data: {
        organizationId,
        ownerId: userId,
        name: dto.name,
        type: dto.type,
        description: dto.description,
        targetAudience: dto.targetAudience || {},
        settings: dto.settings || {},
        status: 'DRAFT',
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'CAMPAIGN_CREATED',
      entityType: 'Campaign',
      entityId: campaign.id,
      newData: { name: dto.name, type: dto.type },
    });

    this.logger.log(`Campaign created: ${campaign.id}`, 'Campaigns');

    return campaign;
  }

  async findById(organizationId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, organizationId },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        sequences: {
          include: {
            sequence: {
              include: {
                steps: { orderBy: { stepNumber: 'asc' } },
              },
            },
          },
        },
        stats: true,
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async list(organizationId: string, filters: CampaignFilters) {
    const { search, type, status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true } },
          stats: true,
          _count: {
            select: { sequences: true },
          },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data: campaigns.map((c) => ({
        ...c,
        sequencesCount: c._count.sequences,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(organizationId: string, userId: string, id: string, dto: UpdateCampaignDto) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, organizationId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status === 'ACTIVE') {
      throw new BadRequestException('Cannot update an active campaign. Please pause it first.');
    }

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        targetAudience: dto.targetAudience,
        settings: dto.settings,
        status: dto.status,
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        stats: true,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'CAMPAIGN_UPDATED',
      entityType: 'Campaign',
      entityId: id,
      newData: dto,
    });

    this.logger.log(`Campaign updated: ${id}`, 'Campaigns');

    return updatedCampaign;
  }

  async delete(organizationId: string, userId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, organizationId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status === 'ACTIVE') {
      throw new BadRequestException('Cannot delete an active campaign. Please pause it first.');
    }

    await this.prisma.campaign.update({
      where: { id },
      data: { status: 'ARCHIVED' as any },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'CAMPAIGN_ARCHIVED',
      entityType: 'Campaign',
      entityId: id,
    });

    return { message: 'Campaign archived successfully' };
  }

  async activate(organizationId: string, userId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, organizationId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status === 'ACTIVE') {
      throw new BadRequestException('Campaign is already active');
    }

    // Check if campaign has at least one sequence
    const sequenceCount = await this.prisma.sequence.count({
      where: { campaignId: id },
    });

    if (sequenceCount === 0) {
      throw new BadRequestException('Campaign must have at least one sequence before activation');
    }

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: { status: 'ACTIVE' as any },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        stats: true,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'CAMPAIGN_ACTIVATED',
      entityType: 'Campaign',
      entityId: id,
    });

    this.logger.log(`Campaign activated: ${id}`, 'Campaigns');

    return updatedCampaign;
  }

  async pause(organizationId: string, userId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, organizationId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== 'ACTIVE') {
      throw new BadRequestException('Campaign is not active');
    }

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: { status: 'PAUSED' as any },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        stats: true,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'CAMPAIGN_PAUSED',
      entityType: 'Campaign',
      entityId: id,
    });

    this.logger.log(`Campaign paused: ${id}`, 'Campaigns');

    return updatedCampaign;
  }

  async getStats(organizationId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, organizationId },
      include: {
        stats: true,
        sequences: {
          include: {
            sequence: {
              include: {
                steps: { orderBy: { stepNumber: 'asc' } },
                prospectSequences: {
                  include: {
                    prospect: { include: { contact: true, company: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Calculate aggregate stats from sequences
    let totalSent = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let totalReplied = 0;
    let totalConverted = 0;

    for (const seq of campaign.sequences) {
      const seqStats = await this.prisma.sequenceStats.findUnique({
        where: { sequenceId: seq.sequenceId },
      });

      if (seqStats) {
        totalSent += seqStats.sent;
        totalOpened += seqStats.opened;
        totalClicked += seqStats.clicked;
        totalReplied += seqStats.replied;
        totalConverted += seqStats.converted;
      }
    }

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
      },
      aggregate: {
        totalSent,
        totalOpened,
        totalClicked,
        totalReplied,
        totalConverted,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
        replyRate: totalSent > 0 ? (totalReplied / totalSent) * 100 : 0,
        conversionRate: totalSent > 0 ? (totalConverted / totalSent) * 100 : 0,
      },
      sequences: campaign.sequences.map((seq) => ({
        id: seq.sequence.id,
        name: seq.sequence.name,
        steps: seq.sequence.steps.length,
        prospects: seq.sequence.prospectSequences.length,
        stats: seq.sequence.stats,
      })),
    };
  }

  async duplicate(organizationId: string, userId: string, id: string) {
    const original = await this.prisma.campaign.findFirst({
      where: { id, organizationId },
      include: {
        sequences: {
          include: {
            sequence: {
              include: { steps: true },
            },
          },
        },
      },
    });

    if (!original) {
      throw new NotFoundException('Campaign not found');
    }

    const newCampaign = await this.prisma.campaign.create({
      data: {
        organizationId,
        ownerId: userId,
        name: `${original.name} (Copy)`,
        type: original.type,
        description: original.description,
        targetAudience: original.targetAudience as object,
        settings: original.settings as object,
        status: 'DRAFT' as any,
      },
    });

    // Duplicate sequences
    for (const seq of original.sequences) {
      const newSequence = await this.prisma.sequence.create({
        data: {
          campaignId: newCampaign.id,
          name: seq.sequence.name,
          description: seq.sequence.description,
          settings: seq.sequence.settings as object,
        },
      });

      // Duplicate steps
      for (const step of seq.sequence.steps) {
        await this.prisma.sequenceStep.create({
          data: {
            sequenceId: newSequence.id,
            stepNumber: step.stepNumber,
            type: step.type as any,
            channel: step.channel as any,
            template: step.template,
            subject: step.subject,
            delayDays: step.delayDays,
            settings: step.settings as object,
          },
        });
      }
    }

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'CAMPAIGN_DUPLICATED',
      entityType: 'Campaign',
      entityId: newCampaign.id,
      newData: { originalId: id },
    });

    this.logger.log(`Campaign duplicated: ${id} -> ${newCampaign.id}`, 'Campaigns');

    return this.findById(organizationId, newCampaign.id);
  }

  async createSequence(
    organizationId: string,
    userId: string,
    campaignId: string,
    name: string,
    description?: string,
  ) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, organizationId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const sequence = await this.prisma.sequence.create({
      data: {
        campaignId,
        name,
        description,
        settings: {},
      },
      include: {
        steps: true,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'SEQUENCE_CREATED',
      entityType: 'Sequence',
      entityId: sequence.id,
      newData: { campaignId, name },
    });

    return sequence;
  }

  async addSequenceStep(
    organizationId: string,
    userId: string,
    sequenceId: string,
    step: SequenceStep,
  ) {
    const sequence = await this.prisma.sequence.findUnique({
      where: { id: sequenceId },
      include: { campaign: true },
    });

    if (!sequence || sequence.campaign.organizationId !== organizationId) {
      throw new NotFoundException('Sequence not found');
    }

    const newStep = await this.prisma.sequenceStep.create({
      data: {
        sequenceId,
        stepNumber: step.stepNumber,
        type: step.type as any,
        channel: step.type === 'EMAIL' ? 'EMAIL' : step.type === 'LINKEDIN' ? 'LINKEDIN' : null,
        template: step.template,
        subject: step.subject,
        delayDays: step.delayDays || 0,
        settings: {},
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'SEQUENCE_STEP_ADDED',
      entityType: 'SequenceStep',
      entityId: newStep.id,
      newData: { sequenceId, stepNumber: step.stepNumber },
    });

    return newStep;
  }

  async getPerformanceMetrics(organizationId: string, id: string, dateRange?: { start: Date; end: Date }) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, organizationId },
      include: {
        sequences: {
          include: {
            sequence: {
              include: {
                prospectSequences: {
                  where: dateRange
                    ? { enrolledAt: { gte: dateRange.start, lte: dateRange.end } }
                    : undefined,
                  include: {
                    prospect: { include: { contact: true, company: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Calculate day-by-day performance
    const dailyStats: Record<string, any> = {};

    for (const seq of campaign.sequences) {
      for (const ps of seq.sequence.prospectSequences) {
        const date = ps.enrolledAt.toISOString().split('T')[0];

        if (!dailyStats[date]) {
          dailyStats[date] = {
            date,
            enrolled: 0,
            sent: 0,
            opened: 0,
            clicked: 0,
            replied: 0,
            converted: 0,
          };
        }

        dailyStats[date].enrolled += 1;

        if (ps.status === 'COMPLETED') {
          dailyStats[date].converted += 1;
        }
      }
    }

    return {
      campaign: { id: campaign.id, name: campaign.name },
      dailyStats: Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date)),
    };
  }
}
