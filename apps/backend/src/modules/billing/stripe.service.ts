import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { LoggerService } from '../../common/utils/logger.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createCustomer(email: string, name: string, metadata?: Record<string, string>) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });
      this.logger.log(`Stripe customer created: ${customer.id}`, 'Stripe');
      return customer;
    } catch (error) {
      this.logger.error(`Failed to create Stripe customer: ${error.message}`, error.stack, 'Stripe');
      throw error;
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>,
  ) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      this.logger.log(`Subscription created: ${subscription.id}`, 'Stripe');
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`, error.stack, 'Stripe');
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, atPeriodEnd = true) {
    try {
      if (atPeriodEnd) {
        const subscription = await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        this.logger.log(`Subscription marked for cancellation: ${subscriptionId}`, 'Stripe');
        return subscription;
      } else {
        const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
        this.logger.log(`Subscription cancelled: ${subscriptionId}`, 'Stripe');
        return subscription;
      }
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`, error.stack, 'Stripe');
      throw error;
    }
  }

  async reactivateSubscription(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });
      this.logger.log(`Subscription reactivated: ${subscriptionId}`, 'Stripe');
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to reactivate subscription: ${error.message}`, error.stack, 'Stripe');
      throw error;
    }
  }

  async changePlan(subscriptionId: string, newPriceId: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      const subscriptionItemId = subscription.items.data[0].id;
      
      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscriptionItemId,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      });
      this.logger.log(`Subscription plan changed: ${subscriptionId}`, 'Stripe');
      return updatedSubscription;
    } catch (error) {
      this.logger.error(`Failed to change plan: ${error.message}`, error.stack, 'Stripe');
      throw error;
    }
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      this.logger.log(`Checkout session created: ${session.id}`, 'Stripe');
      return session;
    } catch (error) {
      this.logger.error(`Failed to create checkout session: ${error.message}`, error.stack, 'Stripe');
      throw error;
    }
  }

  async createBillingPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      this.logger.log(`Billing portal session created: ${session.id}`, 'Stripe');
      return session;
    } catch (error) {
      this.logger.error(`Failed to create billing portal session: ${error.message}`, error.stack, 'Stripe');
      throw error;
    }
  }

  async getInvoices(customerId: string, limit = 10) {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
        limit,
      });
      return invoices.data;
    } catch (error) {
      this.logger.error(`Failed to get invoices: ${error.message}`, error.stack, 'Stripe');
      throw error;
    }
  }

  async constructWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async getUsageRecords(subscriptionId: string, periodStart: Date, periodEnd: Date) {
    try {
      const items = await this.stripe.subscriptionItems.list({
        subscription: subscriptionId,
      });
      
      const usageRecords = await Promise.all(
        items.data.map(async (item) => {
          const summary = await this.stripe.usageRecordSummaries.list(item.id, {
            limit: 1,
          });
          return { itemId: item.id, usage: summary.data };
        }),
      );
      
      return usageRecords;
    } catch (error) {
      this.logger.error(`Failed to get usage records: ${error.message}`, error.stack, 'Stripe');
      throw error;
    }
  }
}