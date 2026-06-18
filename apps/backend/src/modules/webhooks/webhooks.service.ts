import { Injectable } from '@nestjs/common';

export enum WebhookEventType {
  COMPANY_ENRICHED = 'COMPANY_ENRICHED',
}

@Injectable()
export class WebhooksService {
  async create(organizationId: string, data: any) { return { id: 'webhook-1', ...data }; }
  async findById(id: string) { return null; }
  async update(id: string, data: any) { return { id, ...data }; }
  async delete(id: string) { return { deleted: true }; }
  async regenerateSecret(id: string) { return { secret: 'new-secret' }; }
  async toggleWebhook(id: string, enabled: boolean) { return { enabled }; }
  async getDeliveries(webhookId: string) { return []; }
  async retryDelivery(deliveryId: string) { return { retried: true }; }
  async testWebhook(id: string) { return { success: true }; }
  async getWebhookStats(id: string) { return { total: 0, success: 0, failed: 0 }; }
}
