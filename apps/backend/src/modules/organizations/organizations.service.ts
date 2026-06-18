import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/utils/logger.service';
import { AuditLogService } from '../admin/audit-log.service';

export interface UpdateOrganizationDto {
  name?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
}

export interface UpdateSettingsDto {
  emailConfig?: {
    fromName?: string;
    fromEmail?: string;
    signature?: string;
  };
  timezone?: string;
  locale?: string;
  notifications?: {
    emailOnNewProspect?: boolean;
    emailOnMeetingScheduled?: boolean;
    emailOnReply?: boolean;
    dailyDigest?: boolean;
  };
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    customDomain?: string;
  };
  integrations?: Record<string, any>;
}

export interface ICPCriteria {
  industries?: string[];
  companySizes?: string[];
  technologies?: string[];
  locations?: string[];
  keywords?: string[];
  excludeKeywords?: string[];
  revenue?: { min?: number; max?: number };
  fundingStages?: string[];
}

export interface CreateICPDto {
  name: string;
  description?: string;
  criteria: ICPCriteria;
}

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findById(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          where: { deletedAt: null },
          select: { id: true, firstName: true, lastName: true, email: true, jobTitle: true },
        },
        subscription: true,
        _count: {
          select: {
            teams: true,
            prospects: true,
            campaigns: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findBySlug(slug: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { slug },
      include: {
        subscription: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(userId: string, id: string, dto: UpdateOrganizationDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const updatedOrganization = await this.prisma.organization.update({
      where: { id },
      data: dto,
      include: {
        subscription: true,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId: id,
      action: 'ORGANIZATION_UPDATED',
      entityType: 'Organization',
      entityId: id,
      newData: dto,
    });

    this.logger.log(`Organization updated: ${id}`, 'Organizations');

    return updatedOrganization;
  }

  async updateSettings(userId: string, id: string, dto: UpdateSettingsDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const currentSettings = (organization.settings as object) || {};
    const updatedSettings = {
      ...currentSettings,
      ...dto,
    };

    const updatedOrganization = await this.prisma.organization.update({
      where: { id },
      data: { settings: updatedSettings as any },
    });

    await this.auditLogService.log({
      userId,
      organizationId: id,
      action: 'ORGANIZATION_SETTINGS_UPDATED',
      entityType: 'Organization',
      entityId: id,
    });

    this.logger.log(`Organization settings updated: ${id}`, 'Organizations');

    return updatedOrganization;
  }

  async getSettings(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      select: { settings: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization.settings;
  }

  async uploadLogo(userId: string, id: string, logoUrl: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const updatedOrganization = await this.prisma.organization.update({
      where: { id },
      data: { logo: logoUrl },
    });

    await this.auditLogService.log({
      userId,
      organizationId: id,
      action: 'ORGANIZATION_LOGO_UPDATED',
      entityType: 'Organization',
      entityId: id,
    });

    return updatedOrganization;
  }

  // ICP Management
  async listICP(id: string) {
    const icps = await this.prisma.iCP.findMany({
      where: { organizationId: id },
      orderBy: { createdAt: 'desc' },
    });

    return icps;
  }

  async createICP(userId: string, organizationId: string, dto: CreateICPDto) {
    const icp = await this.prisma.iCP.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
        criteria: dto.criteria as any,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'ICP_CREATED',
      entityType: 'ICP',
      entityId: icp.id,
    });

    this.logger.log(`ICP created: ${icp.id}`, 'Organizations');

    return icp;
  }

  async updateICP(userId: string, id: string, dto: Partial<CreateICPDto>) {
    const icp = await this.prisma.iCP.findUnique({
      where: { id },
    });

    if (!icp) {
      throw new NotFoundException('ICP not found');
    }

    const updatedICP = await this.prisma.iCP.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        criteria: dto.criteria as any,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId: icp.organizationId,
      action: 'ICP_UPDATED',
      entityType: 'ICP',
      entityId: id,
      newData: dto,
    });

    return updatedICP;
  }

  async deleteICP(userId: string, id: string) {
    const icp = await this.prisma.iCP.findUnique({
      where: { id },
    });

    if (!icp) {
      throw new NotFoundException('ICP not found');
    }

    await this.prisma.iCP.delete({
      where: { id },
    });

    await this.auditLogService.log({
      userId,
      organizationId: icp.organizationId,
      action: 'ICP_DELETED',
      entityType: 'ICP',
      entityId: id,
    });

    return { message: 'ICP deleted successfully' };
  }

  async toggleICP(userId: string, id: string, isActive: boolean) {
    const icp = await this.prisma.iCP.findUnique({
      where: { id },
    });

    if (!icp) {
      throw new NotFoundException('ICP not found');
    }

    const updatedICP = await this.prisma.iCP.update({
      where: { id },
      data: { isActive },
    });

    await this.auditLogService.log({
      userId,
      organizationId: icp.organizationId,
      action: isActive ? 'ICP_ACTIVATED' : 'ICP_DEACTIVATED',
      entityType: 'ICP',
      entityId: id,
    });

    return updatedICP;
  }

  async matchProspectsToICP(organizationId: string, icpId: string) {
    const icp = await this.prisma.iCP.findUnique({
      where: { id: icpId },
    });

    if (!icp) {
      throw new NotFoundException('ICP not found');
    }

    const criteria = icp.criteria as ICPCriteria;

    // Build query based on ICP criteria
    const where: any = {
      organizationId,
      status: 'ACTIVE',
    };

    if (criteria.industries && criteria.industries.length > 0) {
      where.company = { industry: { in: criteria.industries } };
    }

    if (criteria.companySizes && criteria.companySizes.length > 0) {
      where.company = { ...where.company, size: { in: criteria.companySizes } };
    }

    if (criteria.locations && criteria.locations.length > 0) {
      where.OR = [
        { company: { city: { in: criteria.locations } } },
        { company: { country: { in: criteria.locations } } },
      ];
    }

    const matchingProspects = await this.prisma.prospect.findMany({
      where,
      include: {
        company: true,
        contact: true,
      },
    });

    // Update ICP stats
    await this.prisma.iCP.update({
      where: { id: icpId },
      data: {
        stats: {
          totalMatches: matchingProspects.length,
          lastMatchedAt: new Date().toISOString(),
        } as any,
      },
    });

    return {
      icpId,
      icpName: icp.name,
      totalMatches: matchingProspects.length,
      prospects: matchingProspects.slice(0, 100), // Limit for performance
    };
  }

  async getOrganizationStats(id: string) {
    const [
      totalUsers,
      activeUsers,
      totalProspects,
      activeProspects,
      totalCampaigns,
      activeCampaigns,
      totalMeetings,
      completedMeetings,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count({ where: { organizationId: id, deletedAt: null } }),
      this.prisma.user.count({ where: { organizationId: id, isActive: true } }),
      this.prisma.prospect.count({ where: { organizationId: id } }),
      this.prisma.prospect.count({ where: { organizationId: id, status: 'ACTIVE' } }),
      this.prisma.campaign.count({ where: { organizationId: id } }),
      this.prisma.campaign.count({ where: { organizationId: id, status: 'ACTIVE' } }),
      this.prisma.meeting.count({ where: { organizationId: id } }),
      this.prisma.meeting.count({ where: { organizationId: id, status: 'COMPLETED' } }),
      this.prisma.meeting.aggregate({
        where: { organizationId: id, status: 'COMPLETED', revenue: { not: null } },
        _sum: { revenue: true },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      prospects: {
        total: totalProspects,
        active: activeProspects,
      },
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
      },
      meetings: {
        total: totalMeetings,
        completed: completedMeetings,
      },
      revenue: {
        total: totalRevenue._sum.revenue || 0,
      },
    };
  }

  async deleteOrganization(userId: string, id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Soft delete - mark as deleted
    await this.prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Deactivate all users
    await this.prisma.user.updateMany({
      where: { organizationId: id },
      data: { isActive: false, deletedAt: new Date() },
    });

    await this.auditLogService.log({
      userId,
      organizationId: id,
      action: 'ORGANIZATION_DELETED',
      entityType: 'Organization',
      entityId: id,
    });

    this.logger.log(`Organization deleted: ${id}`, 'Organizations');

    return { message: 'Organization deleted successfully' };
  }
}
