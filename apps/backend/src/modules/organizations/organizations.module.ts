import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { PrismaModule } from '../../database/prisma.module';
import { LoggerModule } from '../../common/utils/logger.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [PrismaModule, LoggerModule, AdminModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
