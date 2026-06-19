import { Module } from '@nestjs/common';
import { CalendlyController } from './calendly.controller';
import { CalendlyService } from './calendly.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CalendlyController],
  providers: [CalendlyService],
  exports: [CalendlyService],
})
export class CalendlyModule {}
