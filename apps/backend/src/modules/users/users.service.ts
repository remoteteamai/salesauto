import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/utils/logger.service';
import { AuditLogService } from '../admin/audit-log.service';
import { AuthUser } from '../auth/auth.service';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
  timezone?: string;
  locale?: string;
}

export interface UserFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
        teamMemberships: {
          include: { team: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        organization: true,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      include: {
        organization: true,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId: user.organizationId ?? undefined,
      action: 'USER_PROFILE_UPDATED',
      entityType: 'User',
      entityId: userId,
      newData: dto,
    });

    this.logger.log(`Profile updated for user: ${userId}`, 'Users');

    return updatedUser;
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });
  }

  async listUsers(organizationId: string, filters: UserFilters) {
    const { search, isActive, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          teamMemberships: {
            include: { team: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deactivateUser(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isSuperAdmin) {
      throw new BadRequestException('Cannot deactivate super admin');
    }

    const deactivatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    await this.auditLogService.log({
      userId: adminId,
      organizationId: user.organizationId ?? undefined,
      action: 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: userId,
    });

    this.logger.log(`User deactivated: ${userId}`, 'Users');

    return deactivatedUser;
  }

  async reactivateUser(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const reactivatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });

    await this.auditLogService.log({
      userId: adminId,
      organizationId: user.organizationId ?? undefined,
      action: 'USER_REACTIVATED',
      entityType: 'User',
      entityId: userId,
    });

    this.logger.log(`User reactivated: ${userId}`, 'Users');

    return reactivatedUser;
  }

  async updateUserRole(
    adminId: string,
    userId: string,
    teamId: string,
    role: 'ADMIN' | 'MEMBER' | 'VIEWER',
  ) {
    const member = await this.prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Team membership not found');
    }

    if (member.role === 'OWNER') {
      throw new BadRequestException('Cannot change owner role');
    }

    const updatedMember = await this.prisma.teamMember.update({
      where: { id: member.id },
      data: { role },
      include: {
        user: true,
        team: true,
      },
    });

    await this.auditLogService.log({
      userId: adminId,
      organizationId: updatedMember.user.organizationId ?? undefined,
      action: 'USER_ROLE_UPDATED',
      entityType: 'TeamMember',
      entityId: member.id,
      newData: { role },
    });

    return updatedMember;
  }
}