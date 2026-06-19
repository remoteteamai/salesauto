import { Test, TestingModule } from '@nestjs/testing';
import { FeatureFlagService } from './feature-flag.service';
import { PrismaService } from '../../database/prisma.service';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagService,
        {
          provide: PrismaService,
          useValue: {
            featureFlag: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              upsert: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FeatureFlagService>(FeatureFlagService);
    prisma = module.get(PrismaService);
  });

  describe('isEnabled', () => {
    it('should return false when flag does not exist', async () => {
      (prisma.featureFlag.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.isEnabled('unknown-flag');

      expect(result).toBe(false);
    });

    it('should return the flag isEnabled value', async () => {
      (prisma.featureFlag.findUnique as jest.Mock).mockResolvedValue({
        key: 'new-feature',
        isEnabled: true,
        metadata: null,
      });

      const result = await service.isEnabled('new-feature');

      expect(result).toBe(true);
    });

    it('should return organization-specific override when present', async () => {
      (prisma.featureFlag.findUnique as jest.Mock).mockResolvedValue({
        key: 'beta-feature',
        isEnabled: false,
        metadata: { organizationOverrides: { 'org-1': true } },
      });

      const result = await service.isEnabled('beta-feature', 'org-1');

      expect(result).toBe(true);
    });

    it('should fall back to global flag when org override is not set', async () => {
      (prisma.featureFlag.findUnique as jest.Mock).mockResolvedValue({
        key: 'beta-feature',
        isEnabled: true,
        metadata: { organizationOverrides: { 'org-other': false } },
      });

      const result = await service.isEnabled('beta-feature', 'org-1');

      expect(result).toBe(true);
    });

    it('should respect org override of false', async () => {
      (prisma.featureFlag.findUnique as jest.Mock).mockResolvedValue({
        key: 'feature-x',
        isEnabled: true,
        metadata: { organizationOverrides: { 'org-1': false } },
      });

      const result = await service.isEnabled('feature-x', 'org-1');

      expect(result).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all flags sorted by key', async () => {
      const mockFlags = [
        { key: 'alpha', isEnabled: true },
        { key: 'beta', isEnabled: false },
      ];
      (prisma.featureFlag.findMany as jest.Mock).mockResolvedValue(mockFlags);

      const result = await service.getAll();

      expect(prisma.featureFlag.findMany).toHaveBeenCalledWith({ orderBy: { key: 'asc' } });
      expect(result).toEqual(mockFlags);
    });
  });

  describe('setFlag', () => {
    it('should upsert a feature flag', async () => {
      const mockFlag = { key: 'new-feature', name: 'new-feature', isEnabled: true, description: 'A new feature' };
      (prisma.featureFlag.upsert as jest.Mock).mockResolvedValue(mockFlag);

      const result = await service.setFlag('new-feature', true, 'A new feature');

      expect(prisma.featureFlag.upsert).toHaveBeenCalledWith({
        where: { key: 'new-feature' },
        create: { key: 'new-feature', name: 'new-feature', isEnabled: true, description: 'A new feature' },
        update: { isEnabled: true, description: 'A new feature' },
      });
      expect(result).toEqual(mockFlag);
    });
  });

  describe('setOrganizationOverride', () => {
    it('should return null when flag does not exist', async () => {
      (prisma.featureFlag.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.setOrganizationOverride('unknown', 'org-1', true);

      expect(result).toBeNull();
    });

    it('should set an org override on an existing flag', async () => {
      (prisma.featureFlag.findUnique as jest.Mock).mockResolvedValue({
        key: 'beta',
        metadata: {},
      });
      (prisma.featureFlag.update as jest.Mock).mockResolvedValue({ key: 'beta', metadata: { organizationOverrides: { 'org-1': true } } });

      const result = await service.setOrganizationOverride('beta', 'org-1', true);

      expect(prisma.featureFlag.update).toHaveBeenCalledWith({
        where: { key: 'beta' },
        data: { metadata: { organizationOverrides: { 'org-1': true } } },
      });
      expect(result).toBeDefined();
    });

    it('should merge with existing org overrides', async () => {
      (prisma.featureFlag.findUnique as jest.Mock).mockResolvedValue({
        key: 'beta',
        metadata: { organizationOverrides: { 'org-existing': false } },
      });
      (prisma.featureFlag.update as jest.Mock).mockResolvedValue({});

      await service.setOrganizationOverride('beta', 'org-new', true);

      expect(prisma.featureFlag.update).toHaveBeenCalledWith({
        where: { key: 'beta' },
        data: { metadata: { organizationOverrides: { 'org-existing': false, 'org-new': true } } },
      });
    });
  });
});
