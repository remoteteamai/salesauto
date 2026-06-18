import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EnrichmentService {
  constructor(private readonly prisma: PrismaService) {}

  async enrichCompany(companyId: string) {
    return { companyId, enriched: true, data: {} };
  }

  async enrichContact(contactId: string) {
    return { contactId, enriched: true, data: {} };
  }
}
