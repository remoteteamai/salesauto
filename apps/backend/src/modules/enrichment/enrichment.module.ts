import { Module, forwardRef } from '@nestjs/common';
import { EnrichmentService } from './enrichment.service';
import { PrismaModule } from '../../database/prisma.module';
import { LoggerModule } from '../../common/utils/logger.module';
import { AdminModule } from '../admin/admin.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    forwardRef(() => AdminModule),
    forwardRef(() => WebhooksModule),
  ],
  providers: [EnrichmentService],
  exports: [EnrichmentService],
})
export class EnrichmentModule {}
