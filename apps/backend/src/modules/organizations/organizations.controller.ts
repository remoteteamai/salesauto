import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators';
import { AuthUser } from '../auth/auth.service';
import { OrganizationsService } from './organizations.service';

class UpdateOrganizationDto {
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

class UpdateSettingsDto {
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

class CreateICPDto {
  name: string;
  description?: string;
  criteria: {
    industries?: string[];
    companySizes?: string[];
    technologies?: string[];
    locations?: string[];
    keywords?: string[];
    excludeKeywords?: string[];
    revenue?: { min?: number; max?: number };
    fundingStages?: string[];
  };
}

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({ status: 200, description: 'Organization details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findById(@Param('id') id: string) {
    return this.organizationsService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get organization by slug' })
  @ApiResponse({ status: 200, description: 'Organization details' })
  async findBySlug(@Param('slug') slug: string) {
    return this.organizationsService.findBySlug(slug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(user.id, id, dto);
  }

  @Put(':id/settings')
  @ApiOperation({ summary: 'Update organization settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async updateSettings(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.organizationsService.updateSettings(user.id, id, dto);
  }

  @Get(':id/settings')
  @ApiOperation({ summary: 'Get organization settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved' })
  async getSettings(@Param('id') id: string) {
    return this.organizationsService.getSettings(id);
  }

  @Put(':id/logo')
  @ApiOperation({ summary: 'Upload organization logo' })
  @ApiResponse({ status: 200, description: 'Logo uploaded' })
  async uploadLogo(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body('logoUrl') logoUrl: string,
  ) {
    return this.organizationsService.uploadLogo(user.id, id, logoUrl);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get organization statistics' })
  @ApiResponse({ status: 200, description: 'Organization stats' })
  async getStats(@Param('id') id: string) {
    return this.organizationsService.getOrganizationStats(id);
  }

  // ICP Endpoints
  @Get(':id/icp')
  @ApiOperation({ summary: 'List ICPs for organization' })
  @ApiResponse({ status: 200, description: 'ICP list' })
  async listICP(@Param('id') id: string) {
    return this.organizationsService.listICP(id);
  }

  @Post(':id/icp')
  @ApiOperation({ summary: 'Create ICP' })
  @ApiResponse({ status: 201, description: 'ICP created' })
  async createICP(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateICPDto,
  ) {
    return this.organizationsService.createICP(user.id, id, dto);
  }

  @Put(':id/icp/:icpId')
  @ApiOperation({ summary: 'Update ICP' })
  @ApiResponse({ status: 200, description: 'ICP updated' })
  async updateICP(
    @CurrentUser() user: AuthUser,
    @Param('icpId') icpId: string,
    @Body() dto: Partial<CreateICPDto>,
  ) {
    return this.organizationsService.updateICP(user.id, icpId, dto);
  }

  @Delete(':id/icp/:icpId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete ICP' })
  @ApiResponse({ status: 200, description: 'ICP deleted' })
  async deleteICP(
    @CurrentUser() user: AuthUser,
    @Param('icpId') icpId: string,
  ) {
    return this.organizationsService.deleteICP(user.id, icpId);
  }

  @Post(':id/icp/:icpId/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle ICP active status' })
  @ApiResponse({ status: 200, description: 'ICP toggled' })
  async toggleICP(
    @CurrentUser() user: AuthUser,
    @Param('icpId') icpId: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.organizationsService.toggleICP(user.id, icpId, isActive);
  }

  @Get(':id/icp/:icpId/match')
  @ApiOperation({ summary: 'Match prospects to ICP' })
  @ApiResponse({ status: 200, description: 'Matching prospects' })
  async matchProspects(
    @Param('id') orgId: string,
    @Param('icpId') icpId: string,
  ) {
    return this.organizationsService.matchProspectsToICP(orgId, icpId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: 'Delete organization' })
  @ApiResponse({ status: 200, description: 'Organization deleted' })
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.organizationsService.deleteOrganization(user.id, id);
  }
}
