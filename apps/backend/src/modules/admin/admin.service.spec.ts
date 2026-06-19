import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/utils/logger.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
            organization: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
            prospect: {
              count: jest.fn(),
            },
            campaign: {
              count: jest.fn(),
            },
            subscription: {
              count: jest.fn(),
            },
            systemSetting: {
              upsert: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get(PrismaService);
  });

  describe('getSystemStats', () => {
    it('should return aggregated system statistics', async () => {
      (prisma.user.count as jest.Mock).mockResolvedValue(100);
      (prisma.organization.count as jest.Mock).mockResolvedValue(20);
      (prisma.prospect.count as jest.Mock).mockResolvedValue(500);
      (prisma.campaign.count as jest.Mock).mockResolvedValue(30);
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.subscription.count as jest.Mock).mockResolvedValue(15);

      const result = await service.getSystemStats();

      expect(result.totalUsers).toBe(100);
      expect(result.totalOrganizations).toBe(20);
      expect(result.totalProspects).toBe(500);
      expect(result.totalCampaigns).toBe(30);
      expect(result.activeSubscriptions).toBe(15);
      expect(result.recentSignups).toEqual([]);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('getAllOrganizations', () => {
    it('should return paginated organizations', async () => {
      const mockOrgs = [{ id: 'org-1', name: 'Org 1', _count: { users: 5, prospects: 10, campaigns: 2 }, subscriptions: [] }];
      (prisma.organization.findMany as jest.Mock).mockResolvedValue(mockOrgs);
      (prisma.organization.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getAllOrganizations(1, 20);

      expect(prisma.organization.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
      expect(result.data).toEqual(mockOrgs);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
    });

    it('should correctly calculate skip for page 2', async () => {
      (prisma.organization.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.organization.count as jest.Mock).mockResolvedValue(25);

      const result = await service.getAllOrganizations(2, 20);

      expect(prisma.organization.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 20 }),
      );
      expect(result.meta.totalPages).toBe(2);
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users excluding deleted', async () => {
      const mockUsers = [{ id: 'u1', email: 'a@b.com', firstName: 'A', lastName: 'B' }];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getAllUsers(1, 20);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
          skip: 0,
          take: 20,
        }),
      );
      expect(result.data).toEqual(mockUsers);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('updateSystemSetting', () => {
    it('should upsert a system setting', async () => {
      const mockSetting = { key: 'maintenance_mode', value: true };
      (prisma.systemSetting.upsert as jest.Mock).mockResolvedValue(mockSetting);

      const result = await service.updateSystemSetting('maintenance_mode', true);

      expect(prisma.systemSetting.upsert).toHaveBeenCalledWith({
        where: { key: 'maintenance_mode' },
        create: { key: 'maintenance_mode', value: true },
        update: { value: true },
      });
      expect(result).toEqual(mockSetting);
    });
  });

  describe('getSystemSettings', () => {
    it('should return settings as a key-value map', async () => {
      const mockSettings = [
        { key: 'maintenance_mode', value: false },
        { key: 'max_users', value: 100 },
      ];
      (prisma.systemSetting.findMany as jest.Mock).mockResolvedValue(mockSettings);

      const result = await service.getSystemSettings();

      expect(result).toEqual({ maintenance_mode: false, max_users: 100 });
    });

    it('should return empty object when no settings exist', async () => {
      (prisma.systemSetting.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getSystemSettings();

      expect(result).toEqual({});
    });
  });
});
