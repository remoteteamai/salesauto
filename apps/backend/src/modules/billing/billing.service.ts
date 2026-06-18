import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubscription(organizationId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { organizationId },
    });
    return subscription || { status: 'FREE', plan: 'FREE_TIER' };
  }

  async getUsage(organizationId: string) {
    const [prospects, campaigns] = await Promise.all([
      this.prisma.prospect.count({ where: { organizationId } }),
      this.prisma.campaign.count({ where: { organizationId } }),
    ]);
    return { prospects, campaigns, limits: { prospects: 100, campaigns: 5 } };
  }

  async createCheckoutSession(organizationId: string, priceId: string) {
    return { sessionId: 'checkout_session_placeholder', url: 'https://stripe.com' };
  }

  async cancelSubscription(organizationId: string) {
    return { success: true };
  }

  async updateSubscription(organizationId: string, priceId: string) {
    return { success: true };
  }
}
