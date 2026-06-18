import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/utils/logger.service';
import { AuditLogService } from '../admin/audit-log.service';

export interface ProspectFilters {
  search?: string;
  stage?: string;
  status?: string;
  priority?: string;
  ownerId?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface CreateProspectDto {
  companyId: string;
  contactId: string;
  stage?: string;
  priority?: string;
  ownerId?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateProspectDto {
  stage?: string;
  status?: string;
  priority?: string;
  ownerId?: string;
  notes?: string;
  tags?: string[];
  nextContactAt?: Date;
}

@Injectable()
export class ProspectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(organizationId: string, userId: string, dto: CreateProspectDto) {
    const prospect = await this.prisma.prospect.create({
      data: {
        organizationId,
        companyId: dto.companyId,
        contactId: dto.contactId,
        stage: dto.stage as any || 'NEW',
        priority: dto.priority as any || 'MEDIUM',
        ownerId: dto.ownerId,
        notes: dto.notes,
        tags: dto.tags || [],
      },
      include: {
        company: true,
        contact: true,
        owner: true,
      },
    });

    // Create activity
    await this.prisma.activity.create({
      data: {
        userId,
        prospectId: prospect.id,
        type: 'PROSPECT_CREATED',
        title: 'Prospect created',
        description: `Prospect ${prospect.company.name} was created`,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'PROSPECT_CREATED',
      entityType: 'Prospect',
      entityId: prospect.id,
    });

    this.logger.log(`Prospect created: ${prospect.id}`, 'Prospects');

    return prospect;
  }

  async findById(organizationId: string, id: string) {
    const prospect = await this.prisma.prospect.findFirst({
      where: { id, organizationId },
      include: {
        company: true,
        contact: true,
        owner: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        sequences: {
          include: { sequence: true },
        },
      },
    });

    if (!prospect) {
      throw new NotFoundException('Prospect not found');
    }

    return prospect;
  }

  async list(organizationId: string, filters: ProspectFilters) {
    const { search, stage, status, priority, ownerId, tags, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { company: { name: { contains: search, mode: 'insensitive' } } },
        { contact: { email: { contains: search, mode: 'insensitive' } } },
        { contact: { firstName: { contains: search, mode: 'insensitive' } } },
        { contact: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (stage) where.stage = stage;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (ownerId) where.ownerId = ownerId;
    if (tags && tags.length > 0) where.tags = { hasSome: tags };

    const [prospects, total] = await Promise.all([
      this.prisma.prospect.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
          contact: true,
          owner: true,
        },
      }),
      this.prisma.prospect.count({ where }),
    ]);

    return {
      data: prospects,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(organizationId: string, userId: string, id: string, dto: UpdateProspectDto) {
    const prospect = await this.prisma.prospect.findFirst({
      where: { id, organizationId },
    });

    if (!prospect) {
      throw new NotFoundException('Prospect not found');
    }

    const oldStage = prospect.stage;
    const updatedProspect = await this.prisma.prospect.update({
      where: { id },
      data: dto,
      include: {
        company: true,
        contact: true,
        owner: true,
      },
    });

    // Create stage change activity
    if (dto.stage && dto.stage !== oldStage) {
      await this.prisma.activity.create({
        data: {
          userId,
          prospectId: prospect.id,
          type: 'PROSPECT_STAGED',
          title: 'Stage changed',
          description: `Stage changed from ${oldStage} to ${dto.stage}`,
        },
      });
    }

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'PROSPECT_UPDATED',
      entityType: 'Prospect',
      entityId: id,
      oldData: { stage: oldStage },
      newData: dto,
    });

    return updatedProspect;
  }

  async delete(organizationId: string, userId: string, id: string) {
    const prospect = await this.prisma.prospect.findFirst({
      where: { id, organizationId },
    });

    if (!prospect) {
      throw new NotFoundException('Prospect not found');
    }

    await this.prisma.prospect.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'PROSPECT_ARCHIVED',
      entityType: 'Prospect',
      entityId: id,
    });

    return { message: 'Prospect archived successfully' };
  }

  async bulkCreate(organizationId: string, userId: string, prospects: CreateProspectDto[]) {
    const results = await Promise.all(
      prospects.map((dto) => this.create(organizationId, userId, dto)),
    );

    return {
      created: results.length,
      prospects: results,
    };
  }

  async assignOwner(organizationId: string, adminId: string, prospectIds: string[], ownerId: string) {
    await this.prisma.prospect.updateMany({
      where: {
        id: { in: prospectIds },
        organizationId,
      },
      data: { ownerId },
    });

    await this.auditLogService.log({
      userId: adminId,
      organizationId,
      action: 'PROSPECTS_ASSIGNED',
      entityType: 'Prospect',
      newData: { prospectIds, ownerId },
    });

    return { assigned: prospectIds.length };
  }

  async getStats(organizationId: string) {
    const [total, byStage, byPriority, recentActivity] = await Promise.all([
      this.prisma.prospect.count({ where: { organizationId, status: 'ACTIVE' } }),
      this.prisma.prospect.groupBy({
        by: ['stage'],
        where: { organizationId, status: 'ACTIVE' },
        _count: true,
      }),
      this.prisma.prospect.groupBy({
        by: ['priority'],
        where: { organizationId, status: 'ACTIVE' },
        _count: true,
      }),
      this.prisma.activity.findMany({
        where: {
          prospect: { organizationId },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          prospect: { include: { company: true, contact: true } },
        },
      }),
    ]);

    return {
      total,
      byStage: byStage.map((s) => ({ stage: s.stage, count: s._count })),
      byPriority: byPriority.map((p) => ({ priority: p.priority, count: p._count })),
      recentActivity,
    };
  }
}