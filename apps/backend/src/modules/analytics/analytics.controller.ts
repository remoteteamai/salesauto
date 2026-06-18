import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import { AuthUser } from '../auth/auth.service';
import { AnalyticsService, DashboardMetrics } from './analytics.service';

class TrackEventDto {
  eventType: string;
  eventCategory: string;
  eventData?: Record<string, any>;
  sessionId?: string;
}

class DateRangeDto {
  start: string;
  end: string;
}

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  @ApiOperation({ summary: 'Track analytics event' })
  @ApiResponse({ status: 201, description: 'Event tracked' })
  async trackEvent(
    @CurrentUser() user: AuthUser,
    @Body() dto: TrackEventDto,
  ) {
    return this.analyticsService.trackEvent(
      user.organizationId!,
      user.id,
      dto.eventType,
      dto.eventCategory,
      dto.eventData,
      dto.sessionId,
    );
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard metrics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Dashboard metrics' })
  async getDashboardMetrics(
    @CurrentUser() user: AuthUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange = startDate && endDate
      ? { start: new Date(startDate), end: new Date(endDate) }
      : undefined;
    return this.analyticsService.getDashboardMetrics(user.organizationId!, dateRange);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get campaign performance metrics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Campaign performance' })
  async getCampaignPerformance(
    @CurrentUser() user: AuthUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange = startDate && endDate
      ? { start: new Date(startDate), end: new Date(endDate) }
      : undefined;
    return this.analyticsService.getCampaignPerformance(user.organizationId!, dateRange);
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Get funnel analytics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Funnel data' })
  async getFunnelAnalytics(
    @CurrentUser() user: AuthUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange = startDate && endDate
      ? { start: new Date(startDate), end: new Date(endDate) }
      : undefined;
    return this.analyticsService.getFunnelAnalytics(user.organizationId!, dateRange);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get activity trends' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Activity trends' })
  async getActivityTrends(
    @CurrentUser() user: AuthUser,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getActivityTrends(user.organizationId!, days || 30);
  }

  @Get('sources')
  @ApiOperation({ summary: 'Get source analytics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Source analytics' })
  async getSourceAnalytics(
    @CurrentUser() user: AuthUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange = startDate && endDate
      ? { start: new Date(startDate), end: new Date(endDate) }
      : undefined;
    return this.analyticsService.getSourceAnalytics(user.organizationId!, dateRange);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user performance metrics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'User performance' })
  async getUserPerformance(
    @CurrentUser() user: AuthUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange = startDate && endDate
      ? { start: new Date(startDate), end: new Date(endDate) }
      : undefined;
    return this.analyticsService.getUserPerformance(user.organizationId!, dateRange);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Revenue analytics' })
  async getRevenueAnalytics(
    @CurrentUser() user: AuthUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange = startDate && endDate
      ? { start: new Date(startDate), end: new Date(endDate) }
      : undefined;
    return this.analyticsService.getRevenueAnalytics(user.organizationId!, dateRange);
  }

  @Get('emails')
  @ApiOperation({ summary: 'Get email analytics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Email analytics' })
  async getEmailAnalytics(
    @CurrentUser() user: AuthUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange = startDate && endDate
      ? { start: new Date(startDate), end: new Date(endDate) }
      : undefined;
    return this.analyticsService.getEmailAnalytics(user.organizationId!, dateRange);
  }

  @Get('timeseries')
  @ApiOperation({ summary: 'Get time series data for a metric' })
  @ApiQuery({ name: 'metric', required: true })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Time series data' })
  async getTimeSeriesData(
    @CurrentUser() user: AuthUser,
    @Query('metric') metric: string,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getTimeSeriesData(user.organizationId!, metric, days || 30);
  }
}
