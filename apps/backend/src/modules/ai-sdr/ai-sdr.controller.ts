import {
  Controller,
  Get,
  Post,
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
import { AISDRService, GenerateOutreachDto } from './ai-sdr.service';

class BulkResearchDto {
  prospectIds: string[];
}

class BulkQualifyDto {
  prospectIds: string[];
}

class ScheduleFollowUpDto {
  prospectId: string;
  sequenceId: string;
  delayDays?: number;
}

@ApiTags('AI SDR')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-sdr')
export class AISDRController {
  constructor(private readonly aiSDRService: AISDRService) {}

  // Prospect Research
  @Post('research/:prospectId')
  @ApiOperation({ summary: 'Research a prospect' })
  @ApiResponse({ status: 201, description: 'Research completed' })
  @ApiResponse({ status: 404, description: 'Prospect not found' })
  async researchProspect(
    @CurrentUser() user: AuthUser,
    @Param('prospectId') prospectId: string,
  ) {
    return this.aiSDRService.researchProspect(user.organizationId!, user.id, prospectId);
  }

  @Post('research/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk research prospects' })
  @ApiResponse({ status: 200, description: 'Bulk research results' })
  async bulkResearch(
    @CurrentUser() user: AuthUser,
    @Body() dto: BulkResearchDto,
  ) {
    return this.aiSDRService.bulkResearch(user.organizationId!, user.id, dto.prospectIds);
  }

  // Outreach Generation
  @Post('outreach')
  @ApiOperation({ summary: 'Generate personalized outreach' })
  @ApiResponse({ status: 201, description: 'Outreach generated' })
  async generateOutreach(
    @CurrentUser() user: AuthUser,
    @Body() dto: GenerateOutreachDto,
  ) {
    return this.aiSDRService.generateOutreach(user.organizationId!, user.id, dto);
  }

  @Post('outreach/variants/:prospectId')
  @ApiOperation({ summary: 'Create A/B test variants for outreach' })
  @ApiQuery({ name: 'variantCount', required: false, type: Number })
  @ApiResponse({ status: 201, description: 'Variants created' })
  async createOutreachVariants(
    @CurrentUser() user: AuthUser,
    @Param('prospectId') prospectId: string,
    @Query('variantCount') variantCount?: number,
  ) {
    return this.aiSDRService.createOutreachVariants(
      user.organizationId!,
      user.id,
      prospectId,
      variantCount,
    );
  }

  @Get('outreach/variants/:contentId/performance')
  @ApiOperation({ summary: 'Track variant performance' })
  @ApiResponse({ status: 200, description: 'Variant performance' })
  async trackVariantPerformance(
    @CurrentUser() user: AuthUser,
    @Param('contentId') contentId: string,
  ) {
    return this.aiSDRService.trackVariantPerformance(user.organizationId!, contentId);
  }

  // Lead Qualification
  @Post('qualify/:prospectId')
  @ApiOperation({ summary: 'Qualify a lead' })
  @ApiResponse({ status: 200, description: 'Qualification result' })
  async qualifyLead(
    @CurrentUser() user: AuthUser,
    @Param('prospectId') prospectId: string,
  ) {
    return this.aiSDRService.qualifyLead(user.organizationId!, user.id, prospectId);
  }

  @Post('qualify/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk qualify leads' })
  @ApiResponse({ status: 200, description: 'Bulk qualification results' })
  async bulkQualify(
    @CurrentUser() user: AuthUser,
    @Body() dto: BulkQualifyDto,
  ) {
    return this.aiSDRService.bulkQualify(user.organizationId!, user.id, dto.prospectIds);
  }

  // Follow-up Automation
  @Post('followup')
  @ApiOperation({ summary: 'Schedule follow-up' })
  @ApiResponse({ status: 200, description: 'Follow-up scheduled' })
  async scheduleFollowUp(
    @CurrentUser() user: AuthUser,
    @Body() dto: ScheduleFollowUpDto,
  ) {
    return this.aiSDRService.scheduleFollowUp(
      user.organizationId!,
      user.id,
      dto.prospectId,
      dto.sequenceId,
      dto.delayDays,
    );
  }

  // Analytics & Metrics
  @Get('metrics')
  @ApiOperation({ summary: 'Get AI SDR metrics' })
  @ApiResponse({ status: 200, description: 'SDR metrics' })
  async getSDRMetrics(@CurrentUser() user: AuthUser) {
    return this.aiSDRService.getSDRMetrics(user.organizationId!);
  }

  // Generated Content
  @Get('content')
  @ApiOperation({ summary: 'List generated content' })
  @ApiQuery({ name: 'prospectId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'isApproved', required: false })
  @ApiQuery({ name: 'isUsed', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Generated content list' })
  async listGeneratedContent(
    @CurrentUser() user: AuthUser,
    @Query('prospectId') prospectId?: string,
    @Query('type') type?: string,
    @Query('isApproved') isApproved?: boolean,
    @Query('isUsed') isUsed?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const where: any = { userId: user.id };
    if (prospectId) where.prospectId = prospectId;
    if (type) where.type = type;
    if (isApproved !== undefined) where.isApproved = isApproved;
    if (isUsed !== undefined) where.isUsed = isUsed;

    const skip = ((page || 1) - 1) * (limit || 20);

    const [content, total] = await Promise.all([
      this.aiSDRService.prisma.generatedContent.findMany({
        where,
        skip,
        take: limit || 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.aiSDRService.prisma.generatedContent.count({ where }),
    ]);

    return {
      data: content,
      meta: {
        total,
        page: page || 1,
        limit: limit || 20,
        totalPages: Math.ceil(total / (limit || 20)),
      },
    };
  }

  @Put('content/:contentId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve generated content' })
  @ApiResponse({ status: 200, description: 'Content approved' })
  async approveContent(
    @CurrentUser() user: AuthUser,
    @Param('contentId') contentId: string,
  ) {
    const content = await this.aiSDRService.prisma.generatedContent.findUnique({
      where: { id: contentId },
    });

    if (!content || content.userId !== user.id) {
      throw new Error('Content not found');
    }

    return this.aiSDRService.prisma.generatedContent.update({
      where: { id: contentId },
      data: { isApproved: true },
    });
  }

  @Put('content/:contentId/mark-used')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark content as used' })
  @ApiResponse({ status: 200, description: 'Content marked as used' })
  async markContentUsed(
    @CurrentUser() user: AuthUser,
    @Param('contentId') contentId: string,
  ) {
    const content = await this.aiSDRService.prisma.generatedContent.findUnique({
      where: { id: contentId },
    });

    if (!content || content.userId !== user.id) {
      throw new Error('Content not found');
    }

    return this.aiSDRService.prisma.generatedContent.update({
      where: { id: contentId },
      data: { isUsed: true },
    });
  }

  // Research Tasks
  @Get('tasks')
  @ApiOperation({ summary: 'List research tasks' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Research tasks list' })
  async listResearchTasks(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const where: any = { userId: user.id };
    if (status) where.status = status;
    if (type) where.type = type;

    const skip = ((page || 1) - 1) * (limit || 20);

    const [tasks, total] = await Promise.all([
      this.aiSDRService.prisma.researchTask.findMany({
        where,
        skip,
        take: limit || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          prospect: {
            include: {
              contact: true,
              company: true,
            },
          },
        },
      }),
      this.aiSDRService.prisma.researchTask.count({ where }),
    ]);

    return {
      data: tasks,
      meta: {
        total,
        page: page || 1,
        limit: limit || 20,
        totalPages: Math.ceil(total / (limit || 20)),
      },
    };
  }

  @Get('tasks/:taskId')
  @ApiOperation({ summary: 'Get research task details' })
  @ApiResponse({ status: 200, description: 'Task details' })
  async getResearchTask(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
  ) {
    return this.aiSDRService.prisma.researchTask.findFirst({
      where: { id: taskId, userId: user.id },
      include: {
        prospect: {
          include: {
            contact: true,
            company: true,
          },
        },
      },
    });
  }
}
