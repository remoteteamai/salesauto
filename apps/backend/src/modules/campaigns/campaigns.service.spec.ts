import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsService } from './campaigns.service';
import { PrismaService } from '../../database/prisma.service';

describe('CampaignsService', () => {
  let service: CampaignsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockCampaign = {
    id: 'campaign-1',
    name: 'Test Campaign',
    type: 'EMAIL',
    status: 'ACTIVE',
    organizationId: 'org-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: PrismaService,
          useValue: {
            campaign: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return all campaigns for an organization', async () => {
      (prisma.campaign.findMany as jest.Mock).mockResolvedValue([mockCampaign]);

      const result = await service.findAll('org-1');

      expect(prisma.campaign.findMany).toHaveBeenCalledWith({ where: { organizationId: 'org-1' } });
      expect(result).toEqual([mockCampaign]);
    });

    it('should return empty array when no campaigns exist', async () => {
      (prisma.campaign.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll('org-empty');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single campaign by id and org', async () => {
      (prisma.campaign.findFirst as jest.Mock).mockResolvedValue(mockCampaign);

      const result = await service.findOne('campaign-1', 'org-1');

      expect(prisma.campaign.findFirst).toHaveBeenCalledWith({
        where: { id: 'campaign-1', organizationId: 'org-1' },
      });
      expect(result).toEqual(mockCampaign);
    });

    it('should return null when campaign is not found', async () => {
      (prisma.campaign.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.findOne('nonexistent', 'org-1');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a campaign with organization id', async () => {
      const createData = { name: 'New Campaign', type: 'EMAIL' };
      (prisma.campaign.create as jest.Mock).mockResolvedValue({ id: 'new-1', ...createData, organizationId: 'org-1' });

      const result = await service.create('org-1', createData);

      expect(prisma.campaign.create).toHaveBeenCalledWith({
        data: { name: 'New Campaign', type: 'EMAIL', organizationId: 'org-1' },
      });
      expect(result.organizationId).toBe('org-1');
    });
  });

  describe('update', () => {
    it('should update a campaign by id', async () => {
      const updateData = { name: 'Updated Campaign' };
      (prisma.campaign.update as jest.Mock).mockResolvedValue({ ...mockCampaign, ...updateData });

      const result = await service.update('campaign-1', 'org-1', updateData);

      expect(prisma.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaign-1' },
        data: updateData,
      });
      expect(result.name).toBe('Updated Campaign');
    });
  });

  describe('delete', () => {
    it('should delete a campaign by id', async () => {
      (prisma.campaign.delete as jest.Mock).mockResolvedValue(mockCampaign);

      const result = await service.delete('campaign-1', 'org-1');

      expect(prisma.campaign.delete).toHaveBeenCalledWith({ where: { id: 'campaign-1' } });
      expect(result).toEqual(mockCampaign);
    });
  });
});
