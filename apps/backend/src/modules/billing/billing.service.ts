import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StripeService } from './stripe.service';
import { LoggerService } from '../../common/utils/logger.service';

export interface CreateSubscriptionDto {
  plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
}

export interface UpdateSubscriptionDto {
  plan?: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
}

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly logger: LoggerService,
  ) {}

  async getSubscription(organizationId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
      include: { invoices: true },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    return subscription;
  }

  async createSubscription(
    organizationId: string,
    userId: string,
    dto: CreateSubscriptionDto,
  ) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if subscription already exists
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (existingSubscription) {
      throw new Error('Organization already has a subscription');
    }

    // Get Stripe price ID based on plan
    const priceId = this.getPriceIdForPlan(dto.plan);

    // Create or get Stripe customer
    let billingAccount = await this.prisma.billingAccount.findUnique({
      where: { organizationId },
    });

    let stripeCustomerId: string;

    if (!billingAccount) {
      const stripeCustomer = await this.stripeService.createCustomer(
        `${organization.slug}@melioro.ai`,
        organization.name,
        { organizationId },
      );
      stripeCustomerId = stripeCustomer.id;

      billingAccount = await this.prisma.billingAccount.create({
        data: {
          organizationId,
          stripeCustomerId,
          billingEmail: `${organization.slug}@melioro.ai`,
          billingName: organization.name,
        },
      });
    } else {
      stripeCustomerId = billingAccount.stripeCustomerId;
    }

    // Create Stripe subscription
    const stripeSubscription = await this.stripeService.createSubscription(
      stripeCustomerId,
      priceId,
      { organizationId },
    );

    // Create local subscription record
    const subscription = await this.prisma.subscription.create({
      data: {
        organizationId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId,
        plan: dto.plan,
        status: 'ACTIVE',
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      },
    });

    this.logger.log(`Subscription created for org: ${organizationId}`, 'Billing');

    return subscription;
  }

  async cancelSubscription(organizationId: string, atPeriodEnd = true) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new NotFoundException('Subscription not found');
    }

    const stripeSubscription = await this.stripeService.cancelSubscription(
      subscription.stripeSubscriptionId,
      atPeriodEnd,
    );

    await this.prisma.subscription.update({
      where: { organizationId },
      data: {
        status: atPeriodEnd ? 'ACTIVE' : 'CANCELED',
        cancelAtPeriodEnd: atPeriodEnd,
      },
    });

    this.logger.log(`Subscription cancelled for org: ${organizationId}`, 'Billing');

    return { message: atPeriodEnd ? 'Subscription will be cancelled at period end' : 'Subscription cancelled immediately' };
  }

  async reactivateSubscription(organizationId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new NotFoundException('Subscription not found');
    }

    await this.stripeService.reactivateSubscription(subscription.stripeSubscriptionId);

    await this.prisma.subscription.update({
      where: { organizationId },
      data: {
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
      },
    });

    this.logger.log(`Subscription reactivated for org: ${organizationId}`, 'Billing');

    return { message: 'Subscription reactivated' };
  }

  async changePlan(organizationId: string, newPlan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE') {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new NotFoundException('Subscription not found');
    }

    const priceId = this.getPriceIdForPlan(newPlan);
    await this.stripeService.changePlan(subscription.stripeSubscriptionId, priceId);

    const updatedSubscription = await this.prisma.subscription.update({
      where: { organizationId },
      data: { plan: newPlan },
    });

    this.logger.log(`Plan changed to ${newPlan} for org: ${organizationId}`, 'Billing');

    return updatedSubscription;
  }

  async createCheckoutSession(organizationId: string, plan: string, returnUrl: string) {
    const billingAccount = await this.prisma.billingAccount.findUnique({
      where: { organizationId },
    });

    if (!billingAccount) {
      throw new NotFoundException('Billing account not found');
    }

    const priceId = this.getPriceIdForPlan(plan as any);
    const session = await this.stripeService.createCheckoutSession(
      billingAccount.stripeCustomerId,
      priceId,
      `${returnUrl}?success=true`,
      `${returnUrl}?canceled=true`,
    );

    return { sessionId: session.id, url: session.url };
  }

  async createBillingPortalSession(organizationId: string, returnUrl: string) {
    const billingAccount = await this.prisma.billingAccount.findUnique({
      where: { organizationId },
    });

    if (!billingAccount) {
      throw new NotFoundException('Billing account not found');
    }

    const session = await this.stripeService.createBillingPortalSession(
      billingAccount.stripeCustomerId,
      returnUrl,
    );

    return { url: session.url };
  }

  async handleWebhookEvent(event: any) {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoiceFailed(event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled webhook event: ${event.type}`, 'Billing');
    }
  }

  private async handleSubscriptionUpdate(data: any) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: data.id },
    });

    if (subscription) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: this.mapStripeStatus(data.status),
          currentPeriodStart: new Date(data.current_period_start * 1000),
          currentPeriodEnd: new Date(data.current_period_end * 1000),
          cancelAtPeriodEnd: data.cancel_at_period_end,
        },
      });
    }
  }

  private async handleSubscriptionDeleted(data: any) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: data.id },
    });

    if (subscription) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELED' },
      });
    }
  }

  private async handleInvoicePaid(data: any) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeCustomerId: data.customer },
    });

    if (subscription) {
      await this.prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          stripeInvoiceId: data.id,
          number: data.number,
          status: 'PAID',
          amount: data.amount_paid,
          currency: data.currency,
          paidAt: new Date(data.status_transitions.paid_at * 1000),
          hostedInvoiceUrl: data.hosted_invoice_url,
          invoicePdf: data.invoice_pdf,
        },
      });
    }
  }

  private async handleInvoiceFailed(data: any) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeCustomerId: data.customer },
    });

    if (subscription) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'PAST_DUE' },
      });

      await this.prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          stripeInvoiceId: data.id,
          number: data.number,
          status: 'OPEN',
          amount: data.amount_due,
          currency: data.currency,
          dueDate: new Date(data.due_date * 1000),
        },
      });
    }
  }

  private mapStripeStatus(status: string): 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | 'INCOMPLETE' {
    const statusMap: Record<string, any> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      trialing: 'TRIALING',
      incomplete: 'INCOMPLETE',
    };
    return statusMap[status] || 'ACTIVE';
  }

  private getPriceIdForPlan(plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'): string {
    const priceIds: Record<string, string> = {
      STARTER: process.env.STRIPE_PRICE_ID_STARTER || 'price_starter',
      PROFESSIONAL: process.env.STRIPE_PRICE_ID_PROFESSIONAL || 'price_professional',
      ENTERPRISE: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'price_enterprise',
    };
    return priceIds[plan];
  }
}