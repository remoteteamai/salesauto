import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('subscription')
  async getSubscription(@Body() body: { organizationId: string }) {
    return this.billingService.getSubscription(body.organizationId);
  }

  @Get('usage')
  async getUsage(@Body() body: { organizationId: string }) {
    return this.billingService.getUsage(body.organizationId);
  }

  @Post('checkout')
  async createCheckout(@Body() body: { organizationId: string; priceId: string }) {
    return this.billingService.createCheckoutSession(body.organizationId, body.priceId);
  }
}
