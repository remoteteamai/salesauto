import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../database/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            prospect: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
            meeting: {
              count: jest.fn(),
            },
            campaign: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
            activity: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get(PrismaService);
  });

  describe('getDashboard', () => {
    it('should return aggregated dashboard stats', async () => {
      (prisma.prospect.count as jest.Mock).mockResolvedValue(50);
      (prisma.meeting.count as jest.Mock).mockResolvedValue(10);
      (prisma.campaign.count as jest.Mock).mockResolvedValue(5);

      const result = await service.getDashboard('org-1');

      expect(prisma.prospect.count).toHaveBeenCalledWith({ where: { organizationId: 'org-1' } });
      expect(prisma.meeting.count).toHaveBeenCalledWith({ where: { organizationId: 'org-1' } });
      expect(prisma.campaign.count).toHaveBeenCalledWith({ where: { organizationId: 'org-1' } });
      expect(result).toEqual({
        totalProspects: 50,
        totalMeetings: 10,
        totalCampaigns: 5,
        pipelineValue: 0,
        meetingsThisMonth: 10,
      });
    });

    it('should return zeros when no data exists', async () => {
      (prisma.prospect.count as jest.Mock).mockResolvedValue(0);
      (prisma.meeting.count as jest.Mock).mockResolvedValue(0);
      (prisma.campaign.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getDashboard('org-empty');

      expect(result.totalProspects).toBe(0);
      expect(result.totalMeetings).toBe(0);
      expect(result.totalCampaigns).toBe(0);
    });
  });

  describe('getCampaignPerformance', () => {
    it('should return campaign performance for all campaigns in an org', async () => {
      const mockCampaigns = [
        { id: 'c1', name: 'Campaign 1', type: 'EMAIL', status: 'ACTIVE', _count: { sequences: 3 } },
        { id: 'c2', name: 'Campaign 2', type: 'LINKEDIN', status: 'DRAFT', _count: { sequences: 1 } },
      ];
      (prisma.campaign.findMany as jest.Mock).mockResolvedValue(mockCampaigns);

      const result = await service.getCampaignPerformance('org-1');

      expect(prisma.campaign.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
        include: { _count: { select: { sequences: true } } },
      });
      expect(result).toEqual([
        { id: 'c1', name: 'Campaign 1', type: 'EMAIL', status: 'ACTIVE', sequences: 3 },
        { id: 'c2', name: 'Campaign 2', type: 'LINKEDIN', status: 'DRAFT', sequences: 1 },
      ]);
    });

    it('should filter by campaignId when provided', async () => {
      (prisma.campaign.findMany as jest.Mock).mockResolvedValue([]);

      await service.getCampaignPerformance('org-1', 'c1');

      expect(prisma.campaign.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-1', id: 'c1' },
        include: { _count: { select: { sequences: true } } },
      });
    });
  });

  describe('getPipelineAnalytics', () => {
    it('should aggregate prospects by stage', async () => {
      const mockProspects = [
        { stage: 'LEAD', priority: 'HIGH' },
        { stage: 'LEAD', priority: 'MEDIUM' },
        { stage: 'QUALIFIED', priority: 'HIGH' },
        { stage: 'MEETING', priority: 'LOW' },
      ];
      (prisma.prospect.findMany as jest.Mock).mockResolvedValue(mockProspects);

      const result = await service.getPipelineAnalytics('org-1');

      expect(prisma.prospect.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
        select: { stage: true, priority: true },
      });
      expect(result).toEqual({
        byStage: { LEAD: 2, QUALIFIED: 1, MEETING: 1 },
        total: 4,
      });
    });

    it('should return empty results when no prospects exist', async () => {
      (prisma.prospect.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getPipelineAnalytics('org-1');

      expect(result).toEqual({ byStage: {}, total: 0 });
    });
  });

  describe('getActivityFeed', () => {
    it('should return activities ordered by date descending', async () => {
      const mockActivities = [
        { id: 'a1', createdAt: new Date(), prospect: { company: {}, contact: {} } },
      ];
      (prisma.activity.findMany as jest.Mock).mockResolvedValue(mockActivities);

      const result = await service.getActivityFeed('org-1');

      expect(prisma.activity.findMany).toHaveBeenCalledWith({
        where: { prospect: { organizationId: 'org-1' } },
        include: { prospect: { include: { company: true, contact: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(result).toEqual(mockActivities);
    });

    it('should respect the limit parameter', async () => {
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);

      await service.getActivityFeed('org-1', 10);

      expect(prisma.activity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });
});
