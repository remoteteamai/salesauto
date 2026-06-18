import { Injectable } from '@nestjs/common';

@Injectable()
export class StripeService {
  async createSession(priceId: string) {
    return { id: 'session_placeholder' };
  }
  async handleWebhook(payload: any) {
    return { received: true };
  }
}
