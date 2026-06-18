import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class IntentService {
  constructor(private readonly prisma: PrismaService) {}
  async getSignals(companyId: string) { return []; }
  async trackHiring(companyId: string) { return { tracked: true }; }
}
