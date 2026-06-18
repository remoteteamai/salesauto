import { Module, forwardRef } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditLogService } from './audit-log.service';
import { FeatureFlagService } from './feature-flag.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AuditLogService, FeatureFlagService],
  exports: [AdminService, AuditLogService, FeatureFlagService],
})
export class AdminModule {}