import { Module } from '@nestjs/common';
import { AISDRController } from './ai-sdr.controller';
import { AISDRService } from './ai-sdr.service';
import { PrismaModule } from '../../database/prisma.module';
import { LoggerModule } from '../../common/utils/logger.module';
import { AdminModule } from '../admin/admin.module';
import { EnrichmentModule } from '../enrichment/enrichment.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, LoggerModule, AdminModule, EnrichmentModule, EmailModule],
  controllers: [AISDRController],
  providers: [AISDRService],
  exports: [AISDRService],
})
export class AISDRModule {}
