import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuditLogService } from './audit-log.service';
import { FeatureFlagService } from './feature-flag.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditLogService: AuditLogService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Get('stats')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get system-wide statistics' })
  @ApiResponse({ status: 200, description: 'System statistics' })
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('organizations')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'List all organizations' })
  async getOrganizations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllOrganizations(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get('users')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'List all users' })
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllUsers(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get('audit-logs')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(
    @CurrentUser() user: AuthUser,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditLogService.getLogs(
      user.organizationId,
      undefined,
      entityType,
      entityId,
      action,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get('feature-flags')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all feature flags' })
  async getFeatureFlags() {
    return this.featureFlagService.getAll();
  }

  @Post('feature-flags')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create or update a feature flag' })
  async setFeatureFlag(
    @Body() body: { key: string; isEnabled: boolean; description?: string },
  ) {
    return this.featureFlagService.setFlag(body.key, body.isEnabled, body.description);
  }

  @Patch('feature-flags/:key')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update a feature flag' })
  async updateFeatureFlag(
    @Param('key') key: string,
    @Body() body: { isEnabled?: boolean; description?: string },
  ) {
    return this.featureFlagService.setFlag(key, body.isEnabled ?? false, body.description);
  }

  @Get('settings')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get system settings' })
  async getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  @Post('settings')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update a system setting' })
  async updateSystemSetting(@Body() body: { key: string; value: any }) {
    return this.adminService.updateSystemSetting(body.key, body.value);
  }
}