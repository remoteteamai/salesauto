import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(organizationId: string) {
    const [totalProspects, totalMeetings, totalCampaigns] = await Promise.all([
      this.prisma.prospect.count({ where: { organizationId } }),
      this.prisma.meeting.count({ where: { organizationId } }),
      this.prisma.campaign.count({ where: { organizationId } }),
    ]);

    return {
      totalProspects,
      totalMeetings,
      totalCampaigns,
      pipelineValue: 0,
      meetingsThisMonth: totalMeetings,
    };
  }

  async getCampaignPerformance(organizationId: string, campaignId?: string) {
    const where: any = { organizationId };
    if (campaignId) where.id = campaignId;

    const campaigns = await this.prisma.campaign.findMany({
      where,
      include: { _count: { select: { sequences: true } } },
    });

    return campaigns.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      status: c.status,
      sequences: c._count.sequences,
    }));
  }

  async getPipelineAnalytics(organizationId: string) {
    const prospects = await this.prisma.prospect.findMany({
      where: { organizationId },
      select: { stage: true, priority: true },
    });

    const byStage = prospects.reduce((acc, p) => {
      acc[p.stage] = (acc[p.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { byStage, total: prospects.length };
  }

  async getActivityFeed(organizationId: string, limit = 50) {
    const activities = await this.prisma.activity.findMany({
      where: { prospect: { organizationId } },
      include: { prospect: { include: { company: true, contact: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities;
  }
}
