import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { LoggerModule } from '../../common/utils/logger.module';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule, PrismaModule, LoggerModule],
  providers: [MailService],
  exports: [MailService],
})
export class EmailModule {}
