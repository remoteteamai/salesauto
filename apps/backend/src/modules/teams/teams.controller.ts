import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators';
import { AuthUser } from '../auth/auth.service';
import { TeamsService } from './teams.service';
import { TeamRole } from '@prisma/client';

class CreateTeamDto {
  name: string;
  description?: string;
}

class UpdateTeamDto {
  name?: string;
  description?: string;
}

class InviteMemberDto {
  email: string;
  role?: TeamRole;
}

class UpdateMemberRoleDto {
  role: TeamRole;
}

class AcceptInvitationDto {
  email: string;
  token: string;
}

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTeamDto,
  ) {
    return this.teamsService.create(user.organizationId!, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all teams' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async list(
    @CurrentUser() user: AuthUser,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.teamsService.list(user.organizationId!, { search, page, limit });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user teams' })
  @ApiResponse({ status: 200, description: 'User teams' })
  async getMyTeams(@CurrentUser() user: AuthUser) {
    return this.teamsService.getUserTeams(user.organizationId!, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiResponse({ status: 200, description: 'Team details' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async findById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.teamsService.findById(user.organizationId!, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update team' })
  @ApiResponse({ status: 200, description: 'Team updated' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamsService.update(user.organizationId!, user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Delete team' })
  @ApiResponse({ status: 200, description: 'Team deleted' })
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.teamsService.delete(user.organizationId!, user.id, id);
  }

  // Member endpoints
  @Get(':id/members')
  @ApiOperation({ summary: 'Get team members' })
  @ApiResponse({ status: 200, description: 'Team members' })
  async getMembers(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.teamsService.getTeamMembers(user.organizationId!, id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to team' })
  @ApiResponse({ status: 201, description: 'Member added' })
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  async addMember(
    @CurrentUser() user: AuthUser,
    @Param('id') teamId: string,
    @Body('memberId') memberId: string,
    @Body('role') role?: TeamRole,
  ) {
    return this.teamsService.addMember(user.organizationId!, user.id, teamId, memberId, role);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove member from team' })
  @ApiResponse({ status: 200, description: 'Member removed' })
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  async removeMember(
    @CurrentUser() user: AuthUser,
    @Param('id') teamId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamsService.removeMember(user.organizationId!, user.id, teamId, memberId);
  }

  @Put(':id/members/:memberId/role')
  @ApiOperation({ summary: 'Update member role' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  async updateMemberRole(
    @CurrentUser() user: AuthUser,
    @Param('id') teamId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.teamsService.updateMemberRole(user.organizationId!, user.id, teamId, memberId, dto.role);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite member by email' })
  @ApiResponse({ status: 201, description: 'Invitation sent' })
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  async inviteMember(
    @CurrentUser() user: AuthUser,
    @Param('id') teamId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.teamsService.inviteMember(
      user.organizationId!,
      user.id,
      teamId,
      dto.email,
      dto.role,
    );
  }

  @Post('accept-invitation')
  @ApiOperation({ summary: 'Accept team invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted' })
  async acceptInvitation(
    @CurrentUser() user: AuthUser,
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.teamsService.acceptInvitation(
      user.organizationId!,
      dto.email,
      dto.token,
      user.id,
    );
  }

  @Get(':id/members/:memberId/permissions')
  @ApiOperation({ summary: 'Get member permissions' })
  @ApiResponse({ status: 200, description: 'Permissions' })
  async getMemberPermissions(
    @CurrentUser() user: AuthUser,
    @Param('id') teamId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamsService.getMemberPermissions(user.organizationId!, memberId, teamId);
  }
}
