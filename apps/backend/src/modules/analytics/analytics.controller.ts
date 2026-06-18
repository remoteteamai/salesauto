import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(@Query('organizationId') organizationId: string) {
    return this.analyticsService.getDashboard(organizationId);
  }

  @Get('campaigns')
  async getCampaignPerformance(@Query('organizationId') organizationId: string) {
    return this.analyticsService.getCampaignPerformance(organizationId);
  }

  @Get('pipeline')
  async getPipelineAnalytics(@Query('organizationId') organizationId: string) {
    return this.analyticsService.getPipelineAnalytics(organizationId);
  }

  @Get('activity')
  async getActivityFeed(@Query('organizationId') organizationId: string) {
    return this.analyticsService.getActivityFeed(organizationId);
  }
}
