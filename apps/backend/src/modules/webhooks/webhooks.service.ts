import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/utils/logger.service';
import { AuditLogService } from '../admin/audit-log.service';
import * as crypto from 'crypto';

export type WebhookEventType =
  | 'stripe.customer.created'
  | 'stripe.customer.updated'
  | 'stripe.customer.deleted'
  | 'stripe.subscription.created'
  | 'stripe.subscription.updated'
  | 'stripe.subscription.deleted'
  | 'stripe.invoice.paid'
  | 'stripe.invoice.payment_failed'
  | 'enrichment.company_completed'
  | 'enrichment.contact_completed'
  | 'campaign.started'
  | 'campaign.completed'
  | 'campaign.step_sent'
  | 'campaign.step_replied'
  | 'meeting.scheduled'
  | 'meeting.completed'
  | 'meeting.canceled'
  | 'prospect.created'
  | 'prospect.stage_changed'
  | 'user.created'
  | 'user.deactivated';

export interface CreateWebhookDto {
  url: string;
  events: WebhookEventType[];
  description?: string;
  headers?: Record<string, string>;
}

export interface UpdateWebhookDto {
  url?: string;
  events?: WebhookEventType[];
  description?: string;
  headers?: Record<string, string>;
  isActive?: boolean;
}

export interface WebhookFilters {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface WebhookDeliveryPayload {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  attempts: number;
  lastAttempt?: Date;
  statusCode?: number;
  error?: string;
  deliveredAt?: Date;
}

@Injectable()
export class WebhooksService {
  private readonly maxRetries = 5;
  private readonly retryDelays = [1000, 5000, 30000, 120000, 300000]; // 1s, 5s, 30s, 2m, 5m

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(organizationId: string, userId: string, dto: CreateWebhookDto) {
    // Validate URL
    try {
      new URL(dto.url);
    } catch {
      throw new BadRequestException('Invalid webhook URL');
    }

    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await this.prisma.webhook.create({
      data: {
        organizationId,
        url: dto.url,
        events: dto.events,
        description: dto.description,
        secret,
        headers: dto.headers || {},
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'WEBHOOK_CREATED',
      entityType: 'Webhook',
      entityId: webhook.id,
      newData: { url: dto.url, events: dto.events },
    });

    this.logger.log(`Webhook created: ${webhook.id}`, 'Webhooks');

    return {
      ...webhook,
      secret: webhook.secret, // Only return secret on creation
    };
  }

  async findById(organizationId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, organizationId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  async list(organizationId: string, filters: WebhookFilters) {
    const { isActive, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [webhooks, total] = await Promise.all([
      this.prisma.webhook.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.webhook.count({ where }),
    ]);

    return {
      data: webhooks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(organizationId: string, userId: string, id: string, dto: UpdateWebhookDto) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, organizationId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    if (dto.url) {
      try {
        new URL(dto.url);
      } catch {
        throw new BadRequestException('Invalid webhook URL');
      }
    }

    const updatedWebhook = await this.prisma.webhook.update({
      where: { id },
      data: {
        url: dto.url,
        events: dto.events,
        description: dto.description,
        headers: dto.headers,
        isActive: dto.isActive,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'WEBHOOK_UPDATED',
      entityType: 'Webhook',
      entityId: id,
      newData: dto,
    });

    this.logger.log(`Webhook updated: ${id}`, 'Webhooks');

    return updatedWebhook;
  }

  async delete(organizationId: string, userId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, organizationId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    // Delete related deliveries
    await this.prisma.webhookDelivery.deleteMany({
      where: { webhookId: id },
    });

    await this.prisma.webhook.delete({
      where: { id },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'WEBHOOK_DELETED',
      entityType: 'Webhook',
      entityId: id,
    });

    this.logger.log(`Webhook deleted: ${id}`, 'Webhooks');

    return { message: 'Webhook deleted successfully' };
  }

  async regenerateSecret(organizationId: string, userId: string, id: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, organizationId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const newSecret = crypto.randomBytes(32).toString('hex');

    const updatedWebhook = await this.prisma.webhook.update({
      where: { id },
      data: { secret: newSecret },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'WEBHOOK_SECRET_REGENERATED',
      entityType: 'Webhook',
      entityId: id,
    });

    this.logger.log(`Webhook secret regenerated: ${id}`, 'Webhooks');

    return {
      ...updatedWebhook,
      secret: updatedWebhook.secret,
    };
  }

  async toggleWebhook(organizationId: string, userId: string, id: string, isActive: boolean) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, organizationId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const updatedWebhook = await this.prisma.webhook.update({
      where: { id },
      data: { isActive },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: isActive ? 'WEBHOOK_ENABLED' : 'WEBHOOK_DISABLED',
      entityType: 'Webhook',
      entityId: id,
    });

    this.logger.log(`Webhook ${isActive ? 'enabled' : 'disabled'}: ${id}`, 'Webhooks');

    return updatedWebhook;
  }

  async getDeliveries(organizationId: string, webhookId: string, page: number = 1, limit: number = 20) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id: webhookId, organizationId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const skip = (page - 1) * limit;

    const [deliveries, total] = await Promise.all([
      this.prisma.webhookDelivery.findMany({
        where: { webhookId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.webhookDelivery.count({ where: { webhookId } }),
    ]);

    return {
      data: deliveries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async retryDelivery(organizationId: string, userId: string, deliveryId: string) {
    const delivery = await this.prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { webhook: true },
    });

    if (!delivery || delivery.webhook.organizationId !== organizationId) {
      throw new NotFoundException('Webhook delivery not found');
    }

    if (delivery.deliveredAt) {
      throw new BadRequestException('Delivery already successful');
    }

    // Attempt delivery
    const result = await this.deliverWebhook(delivery.webhook, delivery.event, delivery.payload);

    // Update delivery
    await this.prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        attempts: delivery.attempts + 1,
        response: result.response,
        statusCode: result.statusCode,
        error: result.error,
        deliveredAt: result.success ? new Date() : null,
      },
    });

    await this.auditLogService.log({
      userId,
      organizationId,
      action: 'WEBHOOK_DELIVERY_RETRY',
      entityType: 'WebhookDelivery',
      entityId: deliveryId,
    });

    return {
      success: result.success,
      message: result.success ? 'Delivery successful' : result.error,
    };
  }

  // Core webhook delivery method
  async dispatch(event: WebhookEventType, payload: any, organizationId?: string) {
    const where: any = {
      isActive: true,
      events: { has: event },
    };

    if (organizationId) {
      where.organizationId = organizationId;
    }

    const webhooks = await this.prisma.webhook.findMany({ where });

    const results: WebhookDeliveryPayload[] = [];

    for (const webhook of webhooks) {
      const delivery = await this.prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event,
          payload: payload as any,
        },
      });

      const result = await this.deliverWebhook(webhook, event, payload);

      await this.prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          attempts: 1,
          response: result.response,
          statusCode: result.statusCode,
          error: result.error,
          deliveredAt: result.success ? new Date() : null,
        },
      });

      // Schedule retries if failed
      if (!result.success && delivery.attempts < this.maxRetries) {
        this.scheduleRetry(delivery.id, webhook.id, event, payload, this.retryDelays[0]);
      }

      results.push({
        id: delivery.id,
        webhookId: webhook.id,
        event,
        payload,
        attempts: 1,
        lastAttempt: new Date(),
        statusCode: result.statusCode,
        error: result.error,
        deliveredAt: result.success ? new Date() : undefined,
      });
    }

    return results;
  }

  private async deliverWebhook(
    webhook: { url: string; secret: string; headers: any },
    event: string,
    payload: any,
  ): Promise<{ success: boolean; statusCode?: number; response?: any; error?: string }> {
    const timestamp = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({ event, timestamp, data: payload });

    // Generate signature
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(`${timestamp}.${body}`)
      .digest('hex');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Timestamp': timestamp.toString(),
      'X-Webhook-Event': event,
      ...(webhook.headers as Record<string, string>),
    };

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      const responseBody = await response.text();

      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          response: responseBody,
        };
      }

      return {
        success: false,
        statusCode: response.status,
        response: responseBody,
        error: `HTTP ${response.status}: ${responseBody.substring(0, 200)}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private scheduleRetry(
    deliveryId: string,
    webhookId: string,
    event: string,
    payload: any,
    delayMs: number,
  ) {
    setTimeout(async () => {
      try {
        const delivery = await this.prisma.webhookDelivery.findUnique({
          where: { id: deliveryId },
          include: { webhook: true },
        });

        if (!delivery || delivery.deliveredAt) return;

        const result = await this.deliverWebhook(delivery.webhook, event, payload);

        await this.prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: {
            attempts: delivery.attempts + 1,
            response: result.response,
            statusCode: result.statusCode,
            error: result.error,
            deliveredAt: result.success ? new Date() : null,
          },
        });

        // Schedule next retry if needed
        if (!result.success && delivery.attempts + 1 < this.maxRetries) {
          const nextDelayIndex = Math.min(delivery.attempts, this.retryDelays.length - 1);
          this.scheduleRetry(deliveryId, webhookId, event, payload, this.retryDelays[nextDelayIndex]);
        }
      } catch (error) {
        this.logger.error(`Webhook retry failed: ${deliveryId}`, error instanceof Error ? error.stack : '', 'Webhooks');
      }
    }, delayMs);
  }

  async testWebhook(organizationId: string, userId: string, webhookId: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id: webhookId, organizationId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const testPayload = {
      test: true,
      webhookId,
      timestamp: new Date().toISOString(),
      message: 'This is a test webhook delivery',
    };

    return this.dispatch('stripe.customer.created' as any, testPayload, organizationId);
  }

  async getWebhookStats(organizationId: string, webhookId: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id: webhookId, organizationId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, successful, failed, recentDeliveries] = await Promise.all([
      this.prisma.webhookDelivery.count({ where: { webhookId } }),
      this.prisma.webhookDelivery.count({
        where: { webhookId, deliveredAt: { not: null } },
      }),
      this.prisma.webhookDelivery.count({
        where: { webhookId, deliveredAt: null },
      }),
      this.prisma.webhookDelivery.findMany({
        where: {
          webhookId,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      webhookId,
      total,
      successful,
      failed,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
      recentDeliveries,
    };
  }
}
