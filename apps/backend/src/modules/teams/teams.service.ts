import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/utils/logger.service';
import { AuditLogService } from '../admin/audit-log.service';
import { MailService } from '../email/mail.service';
import { TeamRole } from '@prisma/client';

export interface CreateTeamDto {
  name: string;
  description?: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
}

export interface InviteMemberDto {
  email: string;
  role?: TeamRole;
}

export interface TeamFilters {
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditLogService: AuditLogService,
    private readonly mailService: MailService,
  ) {}

  async create(organizationId: string, userId: string, dto: CreateTeamDto) {
    const team = await this.prisma.team.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
        members: {
          create: {
            userId,
            role: 'OWNER' as TeamRole,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'TEAM_CREATED',
      entityType: 'Team',
      entityId: team.id,
      newData: { name: dto.name },
    });

    this.logger.log(`Team created: ${team.id}`, 'Teams');

    return team;
  }

  async findById(organizationId: string, id: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, organizationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                jobTitle: true,
                isActive: true,
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async list(organizationId: string, filters: TeamFilters) {
    const { search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
              },
            },
          },
          _count: {
            select: { members: true },
          },
        },
      }),
      this.prisma.team.count({ where }),
    ]);

    return {
      data: teams.map((team) => ({
        ...team,
        memberCount: team._count.members,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(organizationId: string, userId: string, id: string, dto: UpdateTeamDto) {
    const team = await this.prisma.team.findFirst({
      where: { id, organizationId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const updatedTeam = await this.prisma.team.update({
      where: { id },
      data: dto,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'TEAM_UPDATED',
      entityType: 'Team',
      entityId: id,
      newData: dto,
    });

    this.logger.log(`Team updated: ${id}`, 'Teams');

    return updatedTeam;
  }

  async delete(organizationId: string, userId: string, id: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, organizationId },
      include: {
        members: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Prevent deleting the last team
    const teamCount = await this.prisma.team.count({
      where: { organizationId },
    });

    if (teamCount <= 1) {
      throw new BadRequestException('Cannot delete the last team');
    }

    // Delete all team memberships
    await this.prisma.teamMember.deleteMany({
      where: { teamId: id },
    });

    await this.prisma.team.delete({
      where: { id },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'TEAM_DELETED',
      entityType: 'Team',
      entityId: id,
    });

    this.logger.log(`Team deleted: ${id}`, 'Teams');

    return { message: 'Team deleted successfully' };
  }

  async addMember(
    organizationId: string,
    userId: string,
    teamId: string,
    memberId: string,
    role: TeamRole = 'MEMBER',
  ) {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, organizationId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.organizationId !== organizationId) {
      throw new BadRequestException('User is not a member of this organization');
    }

    // Check if already a member
    const existingMembership = await this.prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: memberId,
          teamId,
        },
      },
    });

    if (existingMembership) {
      throw new BadRequestException('User is already a member of this team');
    }

    const member = await this.prisma.teamMember.create({
      data: {
        userId: memberId,
        teamId,
        role,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
        },
        team: true,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'TEAM_MEMBER_ADDED',
      entityType: 'TeamMember',
      entityId: member.id,
      newData: { memberId, teamId, role },
    });

    this.logger.log(`Member ${memberId} added to team ${teamId}`, 'Teams');

    return member;
  }

  async removeMember(organizationId: string, userId: string, teamId: string, memberId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, organizationId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const member = await this.prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: memberId,
          teamId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Team membership not found');
    }

    if (member.role === 'OWNER') {
      throw new BadRequestException('Cannot remove the team owner');
    }

    await this.prisma.teamMember.delete({
      where: { id: member.id },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'TEAM_MEMBER_REMOVED',
      entityType: 'TeamMember',
      entityId: member.id,
      oldData: { memberId, teamId },
    });

    this.logger.log(`Member ${memberId} removed from team ${teamId}`, 'Teams');

    return { message: 'Member removed successfully' };
  }

  async updateMemberRole(
    organizationId: string,
    userId: string,
    teamId: string,
    memberId: string,
    role: TeamRole,
  ) {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, organizationId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const member = await this.prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: memberId,
          teamId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Team membership not found');
    }

    if (member.role === 'OWNER') {
      throw new BadRequestException('Cannot change the team owner role');
    }

    const updatedMember = await this.prisma.teamMember.update({
      where: { id: member.id },
      data: { role },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
        },
        team: true,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'TEAM_MEMBER_ROLE_UPDATED',
      entityType: 'TeamMember',
      entityId: member.id,
      oldData: { role: member.role },
      newData: { role },
    });

    this.logger.log(`Member role updated for ${memberId} in team ${teamId}`, 'Teams');

    return updatedMember;
  }

  async inviteMember(
    organizationId: string,
    inviterId: string,
    teamId: string,
    email: string,
    role: TeamRole = 'MEMBER',
  ) {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, organizationId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterId },
    });

    // Check if user exists in organization
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      if (existingUser.organizationId !== organizationId) {
        throw new BadRequestException('User is not a member of this organization');
      }

      // Check if already a member
      const existingMembership = await this.prisma.teamMember.findUnique({
        where: {
          userId_teamId: {
            userId: existingUser.id,
            teamId,
          },
        },
      });

      if (existingMembership) {
        throw new BadRequestException('User is already a member of this team');
      }

      // Add directly
      return this.addMember(organizationId, inviterId, teamId, existingUser.id, role);
    }

    // Create invitation token
    const invitationToken = Buffer.from(`${email}:${teamId}:${Date.now()}`).toString('base64');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store invitation metadata in organization settings
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    const invitations = (organization?.metadata as any)?.invitations || [];
    invitations.push({
      email: email.toLowerCase(),
      teamId,
      role,
      token: invitationToken,
      invitedBy: inviterId,
      expiresAt: expiresAt.toISOString(),
    });

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        metadata: {
          ...(organization?.metadata as object || {}),
          invitations,
        } as any,
      },
    });

    // Send invitation email
    const appUrl = process.env.APP_URL || 'https://app.melioro.ai';
    const invitationUrl = `${appUrl}/invitations/accept?token=${invitationToken}`;

    await this.mailService.sendInvitationEmail(
      email,
      inviter?.firstName || 'A team member',
      team.name,
      invitationUrl,
    );

    await this.auditLogService.log({
      userId: inviterId,
      organizationId,
      action: 'TEAM_INVITATION_SENT',
      entityType: 'Team',
      entityId: teamId,
      newData: { email, role },
    });

    this.logger.log(`Invitation sent to ${email} for team ${teamId}`, 'Teams');

    return {
      message: 'Invitation sent successfully',
      expiresAt,
    };
  }

  async acceptInvitation(organizationId: string, email: string, token: string, userId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const invitations = (organization?.metadata as any)?.invitations || [];
    const invitation = invitations.find(
      (inv: any) => inv.token === token && inv.email === email.toLowerCase(),
    );

    if (!invitation) {
      throw new BadRequestException('Invalid invitation');
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // Check if user matches the invitation email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
      throw new BadRequestException('Invitation is for a different email address');
    }

    // Add member to team
    await this.addMember(organizationId, userId, invitation.teamId, userId, invitation.role);

    // Remove invitation
    const updatedInvitations = invitations.filter((inv: any) => inv.token !== token);
    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        metadata: {
          ...(organization?.metadata as object || {}),
          invitations: updatedInvitations,
        } as any,
      },
    });

    return { message: 'Invitation accepted successfully' };
  }

  async getMemberPermissions(organizationId: string, userId: string, teamId: string) {
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

    // Define permissions based on role
    const permissions: Record<TeamRole, string[]> = {
      OWNER: ['team:read', 'team:write', 'team:delete', 'team:manage_members', 'team:manage_roles'],
      ADMIN: ['team:read', 'team:write', 'team:manage_members'],
      MEMBER: ['team:read'],
      VIEWER: ['team:read'],
    };

    return {
      role: member.role,
      permissions: permissions[member.role] || [],
    };
  }

  async getUserTeams(organizationId: string, userId: string) {
    const memberships = await this.prisma.teamMember.findMany({
      where: {
        userId,
        team: { organizationId },
      },
      include: {
        team: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      teamId: m.team.id,
      teamName: m.team.name,
      role: m.role,
      memberCount: m.team._count.members,
      joinedAt: m.createdAt,
    }));
  }

  async getTeamMembers(organizationId: string, teamId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, organizationId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return this.prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            jobTitle: true,
            isActive: true,
          },
        },
      },
    });
  }
}
