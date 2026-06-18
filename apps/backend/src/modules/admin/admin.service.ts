import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/utils/logger.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getSystemStats() {
    const [
      totalUsers,
      totalOrganizations,
      totalProspects,
      totalCampaigns,
      recentSignups,
      activeSubscriptions,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.organization.count(),
      this.prisma.prospect.count({ where: { status: 'ACTIVE' } }),
      this.prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          organization: { select: { name: true } },
        },
      }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      totalUsers,
      totalOrganizations,
      totalProspects,
      totalCampaigns,
      recentSignups,
      activeSubscriptions,
      timestamp: new Date().toISOString(),
    };
  }

  async getAllOrganizations(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { users: true, prospects: true, campaigns: true },
          },
          subscription: true,
        },
      }),
      this.prisma.organization.count(),
    ]);

    return {
      data: organizations,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: { deletedAt: null },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          isSuperAdmin: true,
          lastLoginAt: true,
          createdAt: true,
          organization: { select: { name: true, slug: true } },
        },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateSystemSetting(key: string, value: any) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async getSystemSettings() {
    const settings = await this.prisma.systemSetting.findMany();
    return settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, any>);
  }
}