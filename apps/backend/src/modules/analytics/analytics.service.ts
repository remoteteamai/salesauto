import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/utils/logger.service';
import { AuditLogService } from '../admin/audit-log.service';

export interface DashboardMetrics {
  meetingsBooked: number;
  meetingsBookedChange: number;
  pipelineCreated: number;
  pipelineCreatedChange: number;
  revenue: number;
  revenueChange: number;
  activeProspects: number;
  activeProspectsChange: number;
  emailsSent: number;
  emailsSentChange: number;
  replies: number;
  repliesChange: number;
}

export interface FunnelData {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
}

export interface ActivityTrend {
  date: string;
  activities: number;
  type: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async trackEvent(
    organizationId: string,
    userId: string | null,
    eventType: string,
    eventCategory: string,
    eventData: Record<string, any> = {},
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const event = await this.prisma.analyticsEvent.create({
      data: {
        organizationId,
        userId,
        eventType,
        eventCategory,
        eventData,
        sessionId,
        ipAddress,
        userAgent,
      },
    });

    this.logger.debug(`Event tracked: ${eventType}`, 'Analytics');
    return event;
  }

  async getDashboardMetrics(organizationId: string, dateRange?: DateRange) {
    const now = new Date();
    const currentPeriod = dateRange || {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: now,
    };
    const previousPeriod = {
      start: new Date(currentPeriod.start.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: currentPeriod.start,
    };

    // Get meetings booked
    const [currentMeetings, previousMeetings] = await Promise.all([
      this.prisma.meeting.count({
        where: {
          organizationId,
          status: 'COMPLETED',
          startTime: { gte: currentPeriod.start, lte: currentPeriod.end },
        },
      }),
      this.prisma.meeting.count({
        where: {
          organizationId,
          status: 'COMPLETED',
          startTime: { gte: previousPeriod.start, lt: previousPeriod.start },
        },
      }),
    ]);

    // Get pipeline created (prospects with revenue estimates)
    const [currentPipeline, previousPipeline] = await Promise.all([
      this.prisma.prospect.aggregate({
        where: {
          organizationId,
          createdAt: { gte: currentPeriod.start, lte: currentPeriod.end },
        },
        _sum: { estimatedValue: true },
      }),
      this.prisma.prospect.aggregate({
        where: {
          organizationId,
          createdAt: { gte: previousPeriod.start, lt: previousPeriod.start },
        },
        _sum: { estimatedValue: true },
      }),
    ]);

    // Get revenue from meetings
    const [currentRevenue, previousRevenue] = await Promise.all([
      this.prisma.meeting.aggregate({
        where: {
          organizationId,
          status: 'COMPLETED',
          startTime: { gte: currentPeriod.start, lte: currentPeriod.end },
          revenue: { not: null },
        },
        _sum: { revenue: true },
      }),
      this.prisma.meeting.aggregate({
        where: {
          organizationId,
          status: 'COMPLETED',
          startTime: { gte: previousPeriod.start, lt: previousPeriod.start },
          revenue: { not: null },
        },
        _sum: { revenue: true },
      }),
    ]);

    // Get active prospects
    const [currentProspects, previousProspects] = await Promise.all([
      this.prisma.prospect.count({
        where: {
          organizationId,
          status: 'ACTIVE',
        },
      }),
      this.prisma.prospect.count({
        where: {
          organizationId,
          createdAt: { gte: previousPeriod.start, lt: previousPeriod.start },
        },
      }),
    ]);

    // Get emails sent
    const [currentEmails, previousEmails] = await Promise.all([
      this.prisma.activity.count({
        where: {
          prospect: { organizationId },
          type: 'EMAIL_SENT',
          createdAt: { gte: currentPeriod.start, lte: currentPeriod.end },
        },
      }),
      this.prisma.activity.count({
        where: {
          prospect: { organizationId },
          type: 'EMAIL_SENT',
          createdAt: { gte: previousPeriod.start, lt: previousPeriod.start },
        },
      }),
    ]);

    // Get replies
    const [currentReplies, previousReplies] = await Promise.all([
      this.prisma.activity.count({
        where: {
          prospect: { organizationId },
          type: 'EMAIL_REPLIED',
          createdAt: { gte: currentPeriod.start, lte: currentPeriod.end },
        },
      }),
      this.prisma.activity.count({
        where: {
          prospect: { organizationId },
          type: 'EMAIL_REPLIED',
          createdAt: { gte: previousPeriod.start, lt: previousPeriod.start },
        },
      }),
    ]);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      meetingsBooked: currentMeetings,
      meetingsBookedChange: calculateChange(currentMeetings, previousMeetings),
      pipelineCreated: currentPipeline._sum.estimatedValue || 0,
      pipelineCreatedChange: calculateChange(
        currentPipeline._sum.estimatedValue || 0,
        previousPipeline._sum.estimatedValue || 0,
      ),
      revenue: currentRevenue._sum.revenue || 0,
      revenueChange: calculateChange(
        currentRevenue._sum.revenue || 0,
        previousRevenue._sum.revenue || 0,
      ),
      activeProspects: currentProspects,
      activeProspectsChange: calculateChange(currentProspects, previousProspects),
      emailsSent: currentEmails,
      emailsSentChange: calculateChange(currentEmails, previousEmails),
      replies: currentReplies,
      repliesChange: calculateChange(currentReplies, previousReplies),
    } as DashboardMetrics;
  }

  async getCampaignPerformance(organizationId: string, dateRange?: DateRange) {
    const endDate = dateRange?.end || new Date();
    const startDate = dateRange?.start || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const campaigns = await this.prisma.campaign.findMany({
      where: { organizationId },
      include: {
        sequences: {
          include: {
            sequence: {
              include: {
                stats: true,
                prospectSequences: {
                  where: {
                    enrolledAt: { gte: startDate, lte: endDate },
                  },
                },
              },
            },
          },
        },
      },
    });

    const performance = await Promise.all(
      campaigns.map(async (campaign) => {
        let sent = 0;
        let opened = 0;
        let clicked = 0;
        let replied = 0;
        let converted = 0;

        for (const seq of campaign.sequences) {
          sent += seq.sequence.stats?.sent || 0;
          opened += seq.sequence.stats?.opened || 0;
          clicked += seq.sequence.stats?.clicked || 0;
          replied += seq.sequence.stats?.replied || 0;
          converted += seq.sequence.stats?.converted || 0;
        }

        return {
          campaignId: campaign.id,
          campaignName: campaign.name,
          campaignType: campaign.type,
          status: campaign.status,
          enrolled: campaign.sequences.reduce((acc, seq) => acc + seq.sequence.prospectSequences.length, 0),
          sent,
          opened,
          clicked,
          replied,
          converted,
          openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
          clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
          replyRate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
          conversionRate: sent > 0 ? Math.round((converted / sent) * 100) : 0,
        };
      }),
    );

    return performance;
  }

  async getFunnelAnalytics(organizationId: string, dateRange?: DateRange) {
    const endDate = dateRange?.end || new Date();
    const startDate = dateRange?.start || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get prospects at each stage
    const stageCounts = await this.prisma.prospect.groupBy({
      by: ['stage'],
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
    });

    // Get total prospect value
    const totalValue = await this.prisma.prospect.aggregate({
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { estimatedValue: true },
    });

    const stages = [
      { name: 'NEW', order: 1 },
      { name: 'CONTACTED', order: 2 },
      { name: 'QUALIFIED', order: 3 },
      { name: 'PROPOSAL', order: 4 },
      { name: 'NEGOTIATION', order: 5 },
      { name: 'WON', order: 6 },
    ];

    const funnelData: FunnelData[] = [];
    let totalCount = 0;
    let previousCount = 0;

    for (const stage of stages) {
      const count = stageCounts.find((s) => s.stage === stage.name)?._count || 0;
      totalCount += count;

      funnelData.push({
        stage: stage.name,
        count,
        value: 0, // Would need more complex calculation
        conversionRate: previousCount > 0 ? Math.round((count / previousCount) * 100) : 100,
      });

      previousCount = count;
    }

    return {
      stages: funnelData,
      total: {
        prospects: totalCount,
        value: totalValue._sum.estimatedValue || 0,
      },
    };
  }

  async getActivityTrends(organizationId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const activities = await this.prisma.activity.findMany({
      where: {
        prospect: { organizationId },
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        type: true,
        createdAt: true,
      },
    });

    // Group by date and type
    const trends: Record<string, Record<string, number>> = {};

    for (const activity of activities) {
      const date = activity.createdAt.toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = {};
      }
      trends[date][activity.type] = (trends[date][activity.type] || 0) + 1;
    }

    return Object.entries(trends)
      .map(([date, types]) => ({
        date,
        ...types,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getSourceAnalytics(organizationId: string, dateRange?: DateRange) {
    const endDate = dateRange?.end || new Date();
    const startDate = dateRange?.start || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Group prospects by source
    const prospectsBySource = await this.prisma.prospect.groupBy({
      by: ['source'],
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
      _sum: { estimatedValue: true },
    });

    // Group meetings by source
    const meetingsBySource = await this.prisma.meeting.groupBy({
      by: ['source'],
      where: {
        organizationId,
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: true,
      _sum: { revenue: true },
    });

    return {
      prospects: prospectsBySource.map((s) => ({
        source: s.source || 'Unknown',
        count: s._count,
        estimatedValue: s._sum.estimatedValue || 0,
      })),
      meetings: meetingsBySource.map((m) => ({
        source: m.source || 'Unknown',
        count: m._count,
        revenue: m._sum.revenue || 0,
      })),
    };
  }

  async getUserPerformance(organizationId: string, dateRange?: DateRange) {
    const endDate = dateRange?.end || new Date();
    const startDate = dateRange?.start || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activities = await this.prisma.activity.findMany({
      where: {
        prospect: { organizationId },
        createdAt: { gte: startDate, lte: endDate },
        userId: { not: null },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Group by user
    const userStats: Record<string, any> = {};

    for (const activity of activities) {
      if (!activity.userId) continue;

      if (!userStats[activity.userId]) {
        userStats[activity.userId] = {
          userId: activity.userId,
          userName: `${activity.user?.firstName} ${activity.user?.lastName}`,
          emailsSent: 0,
          emailsOpened: 0,
          emailsReplied: 0,
          meetingsScheduled: 0,
          meetingsCompleted: 0,
          calls: 0,
        };
      }

      const stats = userStats[activity.userId];
      switch (activity.type) {
        case 'EMAIL_SENT':
          stats.emailsSent++;
          break;
        case 'EMAIL_OPENED':
          stats.emailsOpened++;
          break;
        case 'EMAIL_REPLIED':
          stats.emailsReplied++;
          break;
        case 'MEETING_SCHEDULED':
          stats.meetingsScheduled++;
          break;
        case 'MEETING_COMPLETED':
          stats.meetingsCompleted++;
          break;
        case 'CALL_MADE':
          stats.calls++;
          break;
      }
    }

    return Object.values(userStats).sort((a: any, b: any) => {
      const aScore = a.emailsSent + a.meetingsCompleted * 10;
      const bScore = b.emailsSent + b.meetingsCompleted * 10;
      return bScore - aScore;
    });
  }

  async getRevenueAnalytics(organizationId: string, dateRange?: DateRange) {
    const endDate = dateRange?.end || new Date();
    const startDate = dateRange?.start || new Date(endDate.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);

    // Group meetings by month
    const meetings = await this.prisma.meeting.findMany({
      where: {
        organizationId,
        status: 'COMPLETED',
        revenue: { not: null },
        startTime: { gte: startDate, lte: endDate },
      },
      select: {
        startTime: true,
        revenue: true,
      },
    });

    // Group by month
    const monthlyRevenue: Record<string, number> = {};

    for (const meeting of meetings) {
      const month = meeting.startTime.toISOString().slice(0, 7); // YYYY-MM
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (meeting.revenue || 0);
    }

    return Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getEmailAnalytics(organizationId: string, dateRange?: DateRange) {
    const endDate = dateRange?.end || new Date();
    const startDate = dateRange?.start || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const emailActivities = await this.prisma.activity.findMany({
      where: {
        prospect: { organizationId },
        type: { in: ['EMAIL_SENT', 'EMAIL_OPENED', 'EMAIL_CLICKED', 'EMAIL_REPLIED', 'EMAIL_BOUNCED'] },
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const counts = {
      sent: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      bounced: 0,
    };

    for (const activity of emailActivities) {
      switch (activity.type) {
        case 'EMAIL_SENT':
          counts.sent++;
          break;
        case 'EMAIL_OPENED':
          counts.opened++;
          break;
        case 'EMAIL_CLICKED':
          counts.clicked++;
          break;
        case 'EMAIL_REPLIED':
          counts.replied++;
          break;
        case 'EMAIL_BOUNCED':
          counts.bounced++;
          break;
      }
    }

    return {
      ...counts,
      openRate: counts.sent > 0 ? Math.round((counts.opened / counts.sent) * 100) : 0,
      clickRate: counts.sent > 0 ? Math.round((counts.clicked / counts.sent) * 100) : 0,
      replyRate: counts.sent > 0 ? Math.round((counts.replied / counts.sent) * 100) : 0,
      bounceRate: counts.sent > 0 ? Math.round((counts.bounced / counts.sent) * 100) : 0,
    };
  }

  async getTimeSeriesData(
    organizationId: string,
    metric: string,
    days: number = 30,
  ) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        organizationId,
        eventType: metric,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        createdAt: true,
        eventData: true,
      },
    });

    // Group by day
    const dailyData: Record<string, number> = {};

    for (const event of events) {
      const date = event.createdAt.toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + 1;
    }

    // Fill in missing days
    const result = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().split('T')[0];
      result.push({
        date,
        value: dailyData[date] || 0,
      });
    }

    return result;
  }
}
