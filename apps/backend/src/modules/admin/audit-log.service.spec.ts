import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService, AuditLogInput } from './audit-log.service';
import { PrismaService } from '../../database/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: PrismaService,
          useValue: {
            auditLog: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    prisma = module.get(PrismaService);
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      const input: AuditLogInput = {
        userId: 'user-1',
        organizationId: 'org-1',
        action: 'CREATE',
        entityType: 'PROSPECT',
        entityId: 'prospect-1',
        oldData: null,
        newData: { name: 'Test' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        metadata: { source: 'api' },
      };
      const mockResult = { id: 'log-1', ...input, createdAt: new Date() };
      (prisma.auditLog.create as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.log(input);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          organizationId: 'org-1',
          action: 'CREATE',
          entityType: 'PROSPECT',
          entityId: 'prospect-1',
          oldData: null,
          newData: { name: 'Test' },
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          metadata: { source: 'api' },
        },
      });
      expect(result).toEqual(mockResult);
    });

    it('should default metadata to empty object when not provided', async () => {
      const input: AuditLogInput = {
        action: 'DELETE',
        entityType: 'CAMPAIGN',
      };
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({});

      await service.log(input);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ metadata: {} }),
      });
    });
  });

  describe('getLogs', () => {
    it('should return paginated logs with default pagination', async () => {
      const mockLogs = [{ id: 'log-1', action: 'CREATE' }];
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getLogs('org-1');

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 50 }),
      );
      expect(result.data).toEqual(mockLogs);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 50, totalPages: 1 });
    });

    it('should filter by all provided parameters', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await service.getLogs('org-1', 'user-1', 'PROSPECT', 'p-1', 'CREATE', startDate, endDate, 2, 10);

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organizationId: 'org-1',
            userId: 'user-1',
            entityType: 'PROSPECT',
            entityId: 'p-1',
            action: 'CREATE',
            createdAt: { gte: startDate, lte: endDate },
          },
          skip: 10,
          take: 10,
        }),
      );
    });

    it('should handle date range with only startDate', async () => {
      const startDate = new Date('2024-01-01');
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

      await service.getLogs(undefined, undefined, undefined, undefined, undefined, startDate);

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { createdAt: { gte: startDate } },
        }),
      );
    });
  });

  describe('getLogsByEntity', () => {
    it('should return logs for a specific entity', async () => {
      const mockLogs = [{ id: 'log-1', entityType: 'PROSPECT', entityId: 'p-1' }];
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);

      const result = await service.getLogsByEntity('PROSPECT', 'p-1');

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { entityType: 'PROSPECT', entityId: 'p-1' },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
        },
      });
      expect(result).toEqual(mockLogs);
    });
  });
});
