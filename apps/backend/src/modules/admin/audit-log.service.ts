import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface AuditLogInput {
  userId?: string;
  organizationId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        organizationId: input.organizationId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldData: input.oldData,
        newData: input.newData,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: input.metadata || {},
      },
    });
  }

  async getLogs(
    organizationId?: string,
    userId?: string,
    entityType?: string,
    entityId?: string,
    action?: string,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 50,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (organizationId) where.organizationId = organizationId;
    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (action) where.action = action;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLogsByEntity(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });
  }
}