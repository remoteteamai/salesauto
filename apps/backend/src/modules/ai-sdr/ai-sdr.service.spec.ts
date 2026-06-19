import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AISDRService } from './ai-sdr.service';
import { PrismaService } from '../../database/prisma.service';

describe('AISDRService', () => {
  let service: AISDRService;
  let prisma: jest.Mocked<PrismaService>;

  const mockProspect = {
    id: 'prospect-1',
    organizationId: 'org-1',
    name: 'Test Prospect',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AISDRService,
        {
          provide: PrismaService,
          useValue: {
            prospect: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AISDRService>(AISDRService);
    prisma = module.get(PrismaService);
  });

  describe('researchProspect', () => {
    it('should return research result when prospect exists', async () => {
      (prisma.prospect.findFirst as jest.Mock).mockResolvedValue(mockProspect);

      const result = await service.researchProspect('org-1', 'user-1', 'prospect-1');

      expect(prisma.prospect.findFirst).toHaveBeenCalledWith({
        where: { id: 'prospect-1', organizationId: 'org-1' },
      });
      expect(result).toEqual({
        taskId: 'prospect-1',
        status: 'completed',
        data: {},
      });
    });

    it('should throw NotFoundException when prospect does not exist', async () => {
      (prisma.prospect.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.researchProspect('org-1', 'user-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkResearch', () => {
    it('should return total count and empty results', async () => {
      const ids = ['p-1', 'p-2', 'p-3'];

      const result = await service.bulkResearch('org-1', 'user-1', ids);

      expect(result).toEqual({ total: 3, results: [] });
    });

    it('should handle empty array', async () => {
      const result = await service.bulkResearch('org-1', 'user-1', []);

      expect(result).toEqual({ total: 0, results: [] });
    });
  });

  describe('generateOutreach', () => {
    it('should return generated outreach content', async () => {
      const dto = { tone: 'professional', length: 'short' };

      const result = await service.generateOutreach('org-1', 'user-1', dto);

      expect(result).toEqual({
        contentId: 'placeholder',
        content: 'Generated outreach content',
        prospect: {},
      });
    });
  });

  describe('bulkQualify', () => {
    it('should return the number of qualified prospects', async () => {
      const ids = ['p-1', 'p-2'];

      const result = await service.bulkQualify('org-1', 'user-1', ids);

      expect(result).toEqual({ qualified: 2 });
    });
  });
});
