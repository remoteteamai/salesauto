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
import { WebhooksService, WebhookEventType } from './webhooks.service';

class CreateWebhookDto {
  url: string;
  events: WebhookEventType[];
  description?: string;
  headers?: Record<string, string>;
}

class UpdateWebhookDto {
  url?: string;
  events?: WebhookEventType[];
  description?: string;
  headers?: Record<string, string>;
  isActive?: boolean;
}

@ApiTags('Webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new webhook' })
  @ApiResponse({ status: 201, description: 'Webhook created' })
  @ApiResponse({ status: 400, description: 'Invalid URL' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateWebhookDto,
  ) {
    return this.webhooksService.create(user.organizationId!, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all webhooks' })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Webhook list' })
  async list(
    @CurrentUser() user: AuthUser,
    @Query('isActive') isActive?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.webhooksService.list(user.organizationId!, { isActive, page, limit });
  }

  @Get('events')
  @ApiOperation({ summary: 'Get available webhook event types' })
  @ApiResponse({ status: 200, description: 'Event types' })
  async getEventTypes() {
    const eventTypes: WebhookEventType[] = [
      'stripe.customer.created',
      'stripe.customer.updated',
      'stripe.customer.deleted',
      'stripe.subscription.created',
      'stripe.subscription.updated',
      'stripe.subscription.deleted',
      'stripe.invoice.paid',
      'stripe.invoice.payment_failed',
      'enrichment.company_completed',
      'enrichment.contact_completed',
      'campaign.started',
      'campaign.completed',
      'campaign.step_sent',
      'campaign.step_replied',
      'meeting.scheduled',
      'meeting.completed',
      'meeting.canceled',
      'prospect.created',
      'prospect.stage_changed',
      'user.created',
      'user.deactivated',
    ];

    return eventTypes.map((type) => ({
      type,
      description: this.getEventDescription(type),
    }));
  }

  private getEventDescription(event: string): string {
    const descriptions: Record<string, string> = {
      'stripe.customer.created': 'A new Stripe customer was created',
      'stripe.customer.updated': 'A Stripe customer was updated',
      'stripe.customer.deleted': 'A Stripe customer was deleted',
      'stripe.subscription.created': 'A new subscription was created',
      'stripe.subscription.updated': 'A subscription was updated',
      'stripe.subscription.deleted': 'A subscription was deleted',
      'stripe.invoice.paid': 'An invoice was paid successfully',
      'stripe.invoice.payment_failed': 'An invoice payment failed',
      'enrichment.company_completed': 'Company enrichment job completed',
      'enrichment.contact_completed': 'Contact enrichment job completed',
      'campaign.started': 'A campaign was started',
      'campaign.completed': 'A campaign was completed',
      'campaign.step_sent': 'A campaign step was sent',
      'campaign.step_replied': 'A reply was received on a campaign step',
      'meeting.scheduled': 'A meeting was scheduled',
      'meeting.completed': 'A meeting was completed',
      'meeting.canceled': 'A meeting was canceled',
      'prospect.created': 'A new prospect was created',
      'prospect.stage_changed': 'A prospect stage was changed',
      'user.created': 'A new user was created',
      'user.deactivated': 'A user was deactivated',
    };

    return descriptions[event] || event;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook by ID' })
  @ApiResponse({ status: 200, description: 'Webhook details' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async findById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.webhooksService.findById(user.organizationId!, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update webhook' })
  @ApiResponse({ status: 200, description: 'Webhook updated' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
  ) {
    return this.webhooksService.update(user.organizationId!, user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete webhook' })
  @ApiResponse({ status: 200, description: 'Webhook deleted' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.webhooksService.delete(user.organizationId!, user.id, id);
  }

  @Post(':id/regenerate-secret')
  @ApiOperation({ summary: 'Regenerate webhook secret' })
  @ApiResponse({ status: 200, description: 'Secret regenerated' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async regenerateSecret(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.webhooksService.regenerateSecret(user.organizationId!, user.id, id);
  }

  @Post(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle webhook active status' })
  @ApiResponse({ status: 200, description: 'Webhook toggled' })
  async toggleWebhook(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.webhooksService.toggleWebhook(user.organizationId!, user.id, id, isActive);
  }

  @Get(':id/deliveries')
  @ApiOperation({ summary: 'Get webhook deliveries' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Webhook deliveries' })
  async getDeliveries(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.webhooksService.getDeliveries(user.organizationId!, id, page, limit);
  }

  @Post('deliveries/:deliveryId/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed webhook delivery' })
  @ApiResponse({ status: 200, description: 'Retry initiated' })
  async retryDelivery(
    @CurrentUser() user: AuthUser,
    @Param('deliveryId') deliveryId: string,
  ) {
    return this.webhooksService.retryDelivery(user.organizationId!, user.id, deliveryId);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Send a test webhook' })
  @ApiResponse({ status: 200, description: 'Test sent' })
  async testWebhook(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.webhooksService.testWebhook(user.organizationId!, user.id, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get webhook statistics' })
  @ApiResponse({ status: 200, description: 'Webhook stats' })
  async getStats(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.webhooksService.getWebhookStats(user.organizationId!, id);
  }
}
