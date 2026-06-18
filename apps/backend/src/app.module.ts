import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './database/prisma.module';
import { LoggerModule } from './common/utils/logger.module';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { TeamsModule } from './modules/teams/teams.module';
import { BillingModule } from './modules/billing/billing.module';
import { ProspectsModule } from './modules/prospects/prospects.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { AISDRModule } from './modules/ai-sdr/ai-sdr.module';
import { IntentModule } from './modules/intent/intent.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmailModule } from './modules/email/email.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { EnrichmentModule } from './modules/enrichment/enrichment.module';

// Configuration
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    PrismaModule,

    // Scheduling
    ScheduleModule.forRoot(),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get('THROTTLE_TTL', 60000),
            limit: config.get('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),

    // Core Modules
    LoggerModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    TeamsModule,
    BillingModule,
    ProspectsModule,
    CampaignsModule,
    AISDRModule,
    IntentModule,
    AnalyticsModule,
    AdminModule,
    EmailModule,
    WebhooksModule,
    EnrichmentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply global middleware here
  }
}