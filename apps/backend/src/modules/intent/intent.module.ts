import { Module } from '@nestjs/common';
import { IntentService } from './intent.service';
import { PrismaModule } from '../../database/prisma.module';
import { LoggerModule } from '../../common/utils/logger.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [PrismaModule, LoggerModule, AdminModule],
  providers: [IntentService],
  exports: [IntentService],
})
export class IntentModule {}
