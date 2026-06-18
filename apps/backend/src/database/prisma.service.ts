import { Injectable, OnModuleInit, OnModuleDestroy, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from '../common/utils/logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: LoggerService) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    this.$on('query' as any, (e: any) => {
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(`${e.query} - ${e.duration}ms`, 'Prisma Query');
      }
    });

    this.$on('error' as any, (e: any) => {
      this.logger.error(`Prisma Error: ${e.message}`, e.stack, 'Prisma');
    });

    this.$on('warn' as any, (e: any) => {
      this.logger.warn(`Prisma Warning: ${e.message}`, 'Prisma');
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully', 'Prisma');
    } catch (error) {
      this.logger.error('Failed to connect to database', error.stack, 'Prisma');
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected', 'Prisma');
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit' as any, async () => {
      await app.close();
    });
  }

  // Helper method for soft deletes
  async softDelete<T extends { update: Function }>(
    model: any,
    where: any,
    data: any = { deletedAt: new Date() }
  ) {
    return model.update({
      where,
      data,
    });
  }

  // Helper method for tenant-scoped queries
  getTenantFilter(organizationId: string) {
    return { organizationId };
  }
}