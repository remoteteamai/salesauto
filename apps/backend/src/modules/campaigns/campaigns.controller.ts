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
import { CurrentUser } from '../../common/decorators';
import { AuthUser } from '../auth/auth.service';
import { CampaignsService } from './campaigns.service';
import { CampaignType, CampaignStatus } from '@prisma/client';

class CreateCampaignDto {
  name: string;
  type: CampaignType;
  description?: string;
  targetAudience?: any;
  settings?: any;
}

class UpdateCampaignDto {
  name?: string;
  description?: string;
  targetAudience?: any;
  settings?: any;
  status?: CampaignStatus;
}

class CreateSequenceDto {
  name: string;
  description?: string;
}

class CreateSequenceStepDto {
  stepNumber: number;
  type: 'EMAIL' | 'LINKEDIN' | 'WAIT';
  template?: string;
  delayDays?: number;
  subject?: string;
}

class CampaignFiltersDto {
  search?: string;
  type?: CampaignType;
  status?: CampaignStatus;
  page?: number;
  limit?: number;
}

@ApiTags('Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.campaignsService.create(user.organizationId!, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all campaigns' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false, enum: CampaignType })
  @ApiQuery({ name: 'status', required: false, enum: CampaignStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async list(
    @CurrentUser() user: AuthUser,
    @Query() filters: CampaignFiltersDto,
  ) {
    return this.campaignsService.list(user.organizationId!, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign details' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async findById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.campaignsService.findById(user.organizationId!, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(user.organizationId!, user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive campaign' })
  @ApiResponse({ status: 200, description: 'Campaign archived' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.campaignsService.delete(user.organizationId!, user.id, id);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate campaign' })
  @ApiResponse({ status: 200, description: 'Campaign activated' })
  @ApiResponse({ status: 400, description: 'Cannot activate campaign' })
  async activate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.campaignsService.activate(user.organizationId!, user.id, id);
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause campaign' })
  @ApiResponse({ status: 200, description: 'Campaign paused' })
  async pause(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.campaignsService.pause(user.organizationId!, user.id, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get campaign statistics' })
  @ApiResponse({ status: 200, description: 'Campaign stats' })
  async getStats(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.campaignsService.getStats(user.organizationId!, id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate campaign' })
  @ApiResponse({ status: 201, description: 'Campaign duplicated' })
  async duplicate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.campaignsService.duplicate(user.organizationId!, user.id, id);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get campaign performance metrics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getPerformance(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange = startDate && endDate
      ? { start: new Date(startDate), end: new Date(endDate) }
      : undefined;
    return this.campaignsService.getPerformanceMetrics(user.organizationId!, id, dateRange);
  }

  // Sequence endpoints
  @Post(':id/sequences')
  @ApiOperation({ summary: 'Create sequence in campaign' })
  @ApiResponse({ status: 201, description: 'Sequence created' })
  async createSequence(
    @CurrentUser() user: AuthUser,
    @Param('id') campaignId: string,
    @Body() dto: CreateSequenceDto,
  ) {
    return this.campaignsService.createSequence(
      user.organizationId!,
      user.id,
      campaignId,
      dto.name,
      dto.description,
    );
  }

  @Post('sequences/:sequenceId/steps')
  @ApiOperation({ summary: 'Add step to sequence' })
  @ApiResponse({ status: 201, description: 'Step added' })
  async addSequenceStep(
    @CurrentUser() user: AuthUser,
    @Param('sequenceId') sequenceId: string,
    @Body() dto: CreateSequenceStepDto,
  ) {
    return this.campaignsService.addSequenceStep(user.organizationId!, user.id, sequenceId, dto);
  }
}
