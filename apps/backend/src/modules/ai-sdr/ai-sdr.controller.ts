import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AISDRService } from './ai-sdr.service';

@Controller('ai-sdr')
@UseGuards(JwtAuthGuard)
export class AISDRController {
  constructor(private readonly aiSDRService: AISDRService) {}

  @Post('research/:prospectId')
  async researchProspect(@Param('prospectId') prospectId: string, @Body() body: any) {
    return this.aiSDRService.researchProspect(body.organizationId, body.userId, prospectId);
  }

  @Post('outreach')
  async generateOutreach(@Body() body: any) {
    return this.aiSDRService.generateOutreach(body.organizationId, body.userId, body);
  }
}
