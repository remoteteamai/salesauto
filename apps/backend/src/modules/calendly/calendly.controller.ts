import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CalendlyService } from './calendly.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('calendly')
export class CalendlyController {
  constructor(private readonly calendlyService: CalendlyService) {}

  @Get('scheduling-url')
  getSchedulingUrl() {
    return {
      url: this.calendlyService.getSchedulingUrl(),
      success: true,
    };
  }

  @Get('event-types')
  @UseGuards(JwtAuthGuard)
  async getEventTypes() {
    const eventTypes = await this.calendlyService.getEventTypes();
    return { data: eventTypes, success: true };
  }

  @Get('scheduled-events')
  @UseGuards(JwtAuthGuard)
  async getScheduledEvents(
    @Query('min_start_time') minStartTime?: string,
    @Query('max_start_time') maxStartTime?: string,
    @Query('status') status?: string,
  ) {
    const events = await this.calendlyService.getScheduledEvents({
      minStartTime,
      maxStartTime,
      status,
    });
    return { data: events, success: true };
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    await this.calendlyService.handleWebhook(body);
    return { success: true };
  }
}
