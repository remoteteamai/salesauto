import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  async create(@Body() body: { organizationId: string; url: string; events: string[] }) {
    return this.webhooksService.create(body.organizationId, body);
  }

  @Get()
  async findAll(@Body() body: { organizationId: string }) {
    return this.webhooksService.findById('list');
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.webhooksService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.webhooksService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.webhooksService.delete(id);
  }

  @Post(':id/regenerate-secret')
  async regenerateSecret(@Param('id') id: string) {
    return this.webhooksService.regenerateSecret(id);
  }

  @Post(':id/test')
  async testWebhook(@Param('id') id: string) {
    return this.webhooksService.testWebhook(id);
  }
}
