import { Module, forwardRef } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaModule } from '../../database/prisma.module';
import { LoggerModule } from '../../common/utils/logger.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [PrismaModule, LoggerModule, forwardRef(() => AdminModule)],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
