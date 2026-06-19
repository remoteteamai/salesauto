import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { PrismaService } from '../../database/prisma.service';

describe('BillingService', () => {
  let service: BillingService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: {
            subscription: {
              findFirst: jest.fn(),
            },
            prospect: {
              count: jest.fn(),
            },
            campaign: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    prisma = module.get(PrismaService);
  });

  describe('getSubscription', () => {
    it('should return the subscription when it exists', async () => {
      const mockSub = { id: 'sub-1', status: 'ACTIVE', plan: 'PRO' };
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(mockSub);

      const result = await service.getSubscription('org-1');

      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
      });
      expect(result).toEqual(mockSub);
    });

    it('should return free tier defaults when no subscription exists', async () => {
      (prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.getSubscription('org-1');

      expect(result).toEqual({ status: 'FREE', plan: 'FREE_TIER' });
    });
  });

  describe('getUsage', () => {
    it('should return prospect and campaign counts with limits', async () => {
      (prisma.prospect.count as jest.Mock).mockResolvedValue(42);
      (prisma.campaign.count as jest.Mock).mockResolvedValue(3);

      const result = await service.getUsage('org-1');

      expect(prisma.prospect.count).toHaveBeenCalledWith({ where: { organizationId: 'org-1' } });
      expect(prisma.campaign.count).toHaveBeenCalledWith({ where: { organizationId: 'org-1' } });
      expect(result).toEqual({
        prospects: 42,
        campaigns: 3,
        limits: { prospects: 100, campaigns: 5 },
      });
    });
  });

  describe('createCheckoutSession', () => {
    it('should return a placeholder checkout session', async () => {
      const result = await service.createCheckoutSession('org-1', 'price_pro');

      expect(result).toEqual({
        sessionId: 'checkout_session_placeholder',
        url: 'https://stripe.com',
      });
    });
  });

  describe('cancelSubscription', () => {
    it('should return success', async () => {
      const result = await service.cancelSubscription('org-1');

      expect(result).toEqual({ success: true });
    });
  });

  describe('updateSubscription', () => {
    it('should return success', async () => {
      const result = await service.updateSubscription('org-1', 'price_enterprise');

      expect(result).toEqual({ success: true });
    });
  });
});
