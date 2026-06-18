import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/utils/logger.service';
import { AuditLogService } from '../admin/audit-log.service';

export type IntentSignalType = 
  | 'HIRING_ENGINEERS'
  | 'HIRING_SALES'
  | 'HIRING_MARKETING'
  | 'HIRING_EXECUTIVE'
  | 'FUNDING_RAISED'
  | 'FUNDING_SERIES_A'
  | 'FUNDING_SERIES_B'
  | 'FUNDING_SERIES_C'
  | 'FUNDING_SEED'
  | 'TECHNOLOGY_ADDED'
  | 'TECHNOLOGY_REMOVED'
  | 'TECHNOLOGY_SWITCHED'
  | 'EXPANSION'
  | 'NEW_OFFICE'
  | 'MERGER'
  | 'ACQUISITION'
  | 'LEADERSHIP_CHANGE'
  | 'PRODUCT_LAUNCH'
  | 'EVENT_PRESENCE'
  | 'JOB_POSTING'
  | 'SOCIAL_GROWTH'
  | 'NEWS_MENTION';

export interface IntentSignal {
  type: IntentSignalType;
  confidence: number; // 0-100
  source: string;
  sourceUrl?: string;
  detectedAt: Date;
  metadata?: Record<string, any>;
}

export interface IntentData {
  companyId: string;
  signals: IntentSignal[];
  overallScore: number;
  categories: {
    hiring: number;
    funding: number;
    technology: number;
    news: number;
  };
}

export interface SignalDetectionCriteria {
  keywords: string[];
  excludeKeywords?: string[];
  patterns?: RegExp[];
  minConfidence?: number;
}

@Injectable()
export class IntentService {
  private readonly signalPatterns: Record<IntentSignalType, SignalDetectionCriteria>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditLogService: AuditLogService,
  ) {
    // Initialize signal detection patterns
    this.signalPatterns = this.initializeSignalPatterns();
  }

  private initializeSignalPatterns(): Record<IntentSignalType, SignalDetectionCriteria> {
    return {
      HIRING_ENGINEERS: {
        keywords: ['hiring engineers', 'software engineer', 'engineering roles', 'technical hiring', 'engineering team'],
        excludeKeywords: ['no longer', 'stopped hiring'],
        minConfidence: 70,
      },
      HIRING_SALES: {
        keywords: ['hiring sales', 'sales rep', 'sales team', 'account executive', 'business development'],
        excludeKeywords: ['no longer', 'stopped hiring'],
        minConfidence: 70,
      },
      HIRING_MARKETING: {
        keywords: ['hiring marketing', 'marketing manager', 'content writer', 'growth marketing', 'digital marketing'],
        excludeKeywords: ['no longer', 'stopped hiring'],
        minConfidence: 70,
      },
      HIRING_EXECUTIVE: {
        keywords: ['hiring CEO', 'hiring CTO', 'hiring COO', 'new VP', 'chief', 'director of'],
        excludeKeywords: ['no longer', 'stopped hiring'],
        minConfidence: 80,
      },
      FUNDING_RAISED: {
        keywords: ['raised', 'funding', 'invested', 'secured', 'closed'],
        excludeKeywords: [],
        patterns: [/\$(\d+[kmb]?)\s*(?:in\s*)?(?:seed|series|funding|investment)/i],
        minConfidence: 85,
      },
      FUNDING_SEED: {
        keywords: ['seed round', 'seed funding', 'pre-seed', 'angel investment'],
        minConfidence: 85,
      },
      FUNDING_SERIES_A: {
        keywords: ['series A', 'series-a'],
        minConfidence: 90,
      },
      FUNDING_SERIES_B: {
        keywords: ['series B', 'series-b'],
        minConfidence: 90,
      },
      FUNDING_SERIES_C: {
        keywords: ['series C', 'series-c', 'series d', 'series-d'],
        minConfidence: 90,
      },
      TECHNOLOGY_ADDED: {
        keywords: ['using', 'powered by', 'built on', 'integrated with', 'now using'],
        excludeKeywords: ['no longer'],
        minConfidence: 75,
      },
      TECHNOLOGY_REMOVED: {
        keywords: ['moved away from', 'switched from', 'no longer using', 'dropped'],
        minConfidence: 75,
      },
      TECHNOLOGY_SWITCHED: {
        keywords: ['switched to', 'migrated to', 'moved to', 'adopted'],
        minConfidence: 75,
      },
      EXPANSION: {
        keywords: ['expanding', 'expansion', 'new market', 'new office', 'new location'],
        minConfidence: 80,
      },
      NEW_OFFICE: {
        keywords: ['new office', 'opening office', 'new headquarters', 'new location'],
        minConfidence: 85,
      },
      MERGER: {
        keywords: ['merger', 'merged with', 'merging'],
        minConfidence: 90,
      },
      ACQUISITION: {
        keywords: ['acquired', 'acquisition', 'buying', 'purchased'],
        minConfidence: 90,
      },
      LEADERSHIP_CHANGE: {
        keywords: ['new CEO', 'new CTO', 'new COO', 'new CFO', 'new CMO', 'new CRO', 'joined as', 'appointed'],
        excludeKeywords: ['no longer', 'stepping down'],
        minConfidence: 85,
      },
      PRODUCT_LAUNCH: {
        keywords: ['launch', 'launching', 'released', 'unveiled', 'introducing'],
        excludeKeywords: ['leaked'],
        minConfidence: 80,
      },
      EVENT_PRESENCE: {
        keywords: ['attending', 'present at', 'sponsoring', 'speaking at', 'presenting at'],
        minConfidence: 70,
      },
      JOB_POSTING: {
        keywords: ['job posting', 'careers page', 'open positions', 'we\'re hiring', 'join our team'],
        minConfidence: 65,
      },
      SOCIAL_GROWTH: {
        keywords: ['followers', 'linkedin', 'twitter', 'social media'],
        patterns: [/(?:grew|increased|grown)\s+(?:by\s+)?\d+%/i],
        minConfidence: 60,
      },
      NEWS_MENTION: {
        keywords: ['featured in', 'mentioned in', 'covered by', 'news', 'press release', 'announcement'],
        minConfidence: 50,
      },
    };
  }

  async analyzeCompanyIntent(companyId: string): Promise<IntentData> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        prospects: {
          include: {
            activities: {
              orderBy: { createdAt: 'desc' },
              take: 50,
            },
          },
        },
      },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // Collect text data from various sources
    const textData = await this.collectCompanyTextData(companyId);

    // Detect signals
    const signals = this.detectSignals(textData);

    // Calculate category scores
    const categories = this.calculateCategoryScores(signals);

    // Calculate overall score
    const overallScore = this.calculateOverallScore(signals, categories);

    return {
      companyId,
      signals,
      overallScore,
      categories,
    };
  }

  async detectHiringSignals(companyId: string): Promise<IntentSignal[]> {
    const textData = await this.collectCompanyTextData(companyId);
    const hiringSignals = this.detectSignals(textData).filter((s) =>
      s.type.startsWith('HIRING_'),
    );
    return hiringSignals;
  }

  async detectFundingSignals(companyId: string): Promise<IntentSignal[]> {
    const textData = await this.collectCompanyTextData(companyId);
    const fundingSignals = this.detectSignals(textData).filter((s) =>
      s.type.startsWith('FUNDING_'),
    );
    return fundingSignals;
  }

  async detectTechnologySignals(companyId: string): Promise<IntentSignal[]> {
    const textData = await this.collectCompanyTextData(companyId);
    const techSignals = this.detectSignals(textData).filter((s) =>
      s.type.startsWith('TECHNOLOGY_'),
    );
    return techSignals;
  }

  private async collectCompanyTextData(companyId: string): Promise<string> {
    // Collect text from company description, job postings, news, etc.
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    const texts: string[] = [];

    if (company?.description) {
      texts.push(company.description);
    }

    if (company?.metadata) {
      const metadata = company.metadata as Record<string, any>;
      if (metadata.techStack) {
        texts.push(metadata.techStack.join(' '));
      }
      if (metadata.news) {
        texts.push(metadata.news.join(' '));
      }
    }

    // Get recent activities
    const activities = await this.prisma.activity.findMany({
      where: {
        prospect: { companyId },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    activities.forEach((a) => {
      if (a.title) texts.push(a.title);
      if (a.description) texts.push(a.description);
    });

    return texts.join(' ');
  }

  private detectSignals(textData: string): IntentSignal[] {
    const signals: IntentSignal[] = [];
    const text = textData.toLowerCase();

    for (const [signalType, criteria] of Object.entries(this.signalPatterns)) {
      const detection = this.detectSignal(signalType as IntentSignalType, text, criteria);
      if (detection) {
        signals.push(detection);
      }
    }

    // Sort by confidence
    return signals.sort((a, b) => b.confidence - a.confidence);
  }

  private detectSignal(
    type: IntentSignalType,
    text: string,
    criteria: SignalDetectionCriteria,
  ): IntentSignal | null {
    // Check exclusion keywords first
    if (criteria.excludeKeywords) {
      for (const excludeKeyword of criteria.excludeKeywords) {
        if (text.includes(excludeKeyword.toLowerCase())) {
          return null;
        }
      }
    }

    // Check keyword matches
    let keywordMatches = 0;
    for (const keyword of criteria.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    }

    // Calculate base confidence from keyword matches
    let confidence = 0;
    if (keywordMatches > 0) {
      confidence = Math.min(100, (keywordMatches / criteria.keywords.length) * 100 + 30);
    }

    // Check pattern matches
    if (criteria.patterns) {
      for (const pattern of criteria.patterns) {
        if (pattern.test(text)) {
          confidence = Math.min(100, confidence + 20);
          break;
        }
      }
    }

    // Apply minimum confidence threshold
    const minConfidence = criteria.minConfidence || 50;
    if (confidence < minConfidence) {
      return null;
    }

    return {
      type,
      confidence: Math.round(confidence),
      source: 'content_analysis',
      detectedAt: new Date(),
      metadata: {
        keywordMatches,
        totalKeywords: criteria.keywords.length,
      },
    };
  }

  private calculateCategoryScores(signals: IntentSignal[]): IntentData['categories'] {
    const categories = {
      hiring: 0,
      funding: 0,
      technology: 0,
      news: 0,
    };

    for (const signal of signals) {
      let category: keyof typeof categories;
      
      if (signal.type.startsWith('HIRING_')) {
        category = 'hiring';
      } else if (signal.type.startsWith('FUNDING_')) {
        category = 'funding';
      } else if (signal.type.startsWith('TECHNOLOGY_')) {
        category = 'technology';
      } else {
        category = 'news';
      }

      // Weight by confidence
      categories[category] += signal.confidence * 0.1;
    }

    // Cap at 100
    for (const cat of Object.keys(categories) as Array<keyof typeof categories>) {
      categories[cat] = Math.min(100, Math.round(categories[cat]));
    }

    return categories;
  }

  private calculateOverallScore(signals: IntentSignal[], categories: IntentData['categories']): number {
    if (signals.length === 0) return 0;

    // Weight categories
    const weights = {
      hiring: 0.3,    // High buying intent signal
      funding: 0.35,  // Budget available
      technology: 0.15,
      news: 0.2,
    };

    let weightedScore = 0;
    weightedScore += categories.hiring * weights.hiring;
    weightedScore += categories.funding * weights.funding;
    weightedScore += categories.technology * weights.technology;
    weightedScore += categories.news * weights.news;

    // Factor in number of signals
    const signalBonus = Math.min(10, signals.length * 2);

    return Math.min(100, Math.round(weightedScore + signalBonus));
  }

  async trackSignal(
    organizationId: string,
    companyId: string,
    signal: IntentSignal,
  ) {
    // Store signal in company metadata
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    const existingSignals = (company.metadata as any)?.intentSignals || [];
    existingSignals.push(signal);

    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        metadata: {
          ...(company.metadata as object || {}),
          intentSignals: existingSignals,
          lastSignalDetected: new Date().toISOString(),
        } as any,
      },
    });

    // Create activity
    await this.prisma.activity.create({
      data: {
        prospectId: undefined,
        type: 'NOTE_ADDED',
        title: `Intent signal detected: ${signal.type}`,
        description: `Confidence: ${signal.confidence}%`,
        metadata: signal as any,
      },
    });

    this.logger.log(`Intent signal detected for company ${companyId}: ${signal.type}`, 'Intent');

    return signal;
  }

  async getHighIntentProspects(organizationId: string, minScore: number = 50) {
    const companies = await this.prisma.company.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        domain: true,
        metadata: true,
        prospects: {
          where: { status: 'ACTIVE' },
          include: {
            contact: true,
          },
        },
      },
    });

    const highIntentProspects = [];

    for (const company of companies) {
      const metadata = company.metadata as any;
      const intentSignals = metadata?.intentSignals || [];
      const lastSignal = intentSignals[0] as IntentSignal | undefined;

      if (lastSignal && lastSignal.confidence >= minScore) {
        highIntentProspects.push({
          companyId: company.id,
          companyName: company.name,
          domain: company.domain,
          intentScore: lastSignal.confidence,
          lastSignal: lastSignal.type,
          signalDetectedAt: lastSignal.detectedAt,
          prospects: company.prospects.map((p) => ({
            prospectId: p.id,
            contactId: p.contactId,
            contactName: `${p.contact?.firstName} ${p.contact?.lastName}`,
            contactEmail: p.contact?.email,
          })),
        });
      }
    }

    // Sort by intent score
    return highIntentProspects.sort((a, b) => b.intentScore - a.intentScore);
  }

  async getIntentTrends(organizationId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const companies = await this.prisma.company.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        metadata: true,
      },
    });

    const trends: Record<string, number> = {};
    const signalCounts: Record<string, Record<string, number>> = {};

    for (const company of companies) {
      const metadata = company.metadata as any;
      const intentSignals = metadata?.intentSignals || [];

      for (const signal of intentSignals) {
        const signalData = signal as IntentSignal;
        const dateKey = new Date(signalData.detectedAt).toISOString().split('T')[0];
        
        trends[dateKey] = (trends[dateKey] || 0) + 1;
        
        if (!signalCounts[dateKey]) {
          signalCounts[dateKey] = {};
        }
        signalCounts[dateKey][signalData.type] = (signalCounts[dateKey][signalData.type] || 0) + 1;
      }
    }

    return {
      dailyCounts: Object.entries(trends)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      signalBreakdown: signalCounts,
    };
  }

  async scoreProspect(prospectId: string): Promise<{ score: number; factors: Record<string, number> }> {
    const prospect = await this.prisma.prospect.findUnique({
      where: { id: prospectId },
      include: {
        company: true,
        contact: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!prospect) {
      throw new Error('Prospect not found');
    }

    const factors: Record<string, number> = {};

    // Intent score (40% weight)
    const intentScore = await this.calculateCompanyIntentScore(prospect.companyId);
    factors.intentScore = intentScore;

    // Engagement score (30% weight)
    const engagementScore = this.calculateEngagementScore(prospect.activities);
    factors.engagementScore = engagementScore;

    // Fit score (20% weight)
    const fitScore = await this.calculateFitScore(prospect.companyId);
    factors.fitScore = fitScore;

    // Activity recency (10% weight)
    const recencyScore = this.calculateRecencyScore(prospect.activities);
    factors.recencyScore = recencyScore;

    // Weighted total
    const totalScore = Math.round(
      intentScore * 0.4 +
      engagementScore * 0.3 +
      fitScore * 0.2 +
      recencyScore * 0.1,
    );

    return {
      score: totalScore,
      factors,
    };
  }

  private async calculateCompanyIntentScore(companyId: string): Promise<number> {
    const intentData = await this.analyzeCompanyIntent(companyId);
    return intentData.overallScore;
  }

  private calculateEngagementScore(activities: any[]): number {
    if (activities.length === 0) return 0;

    let score = 0;

    // Count different activity types
    const activityTypes = new Set(activities.map((a) => a.type));

    for (const type of activityTypes) {
      switch (type) {
        case 'EMAIL_REPLIED':
          score += 25;
          break;
        case 'EMAIL_CLICKED':
          score += 15;
          break;
        case 'EMAIL_OPENED':
          score += 10;
          break;
        case 'MEETING_SCHEDULED':
        case 'MEETING_COMPLETED':
          score += 30;
          break;
        case 'CALL_MADE':
          score += 20;
          break;
      }
    }

    return Math.min(100, score);
  }

  private async calculateFitScore(companyId: string): Promise<number> {
    // Check against organization's ICP
    // This is a simplified version - in production, would match against actual ICP criteria
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    let score = 50; // Base score

    if (company?.industry) score += 10;
    if (company?.size) score += 10;
    if (company?.linkedinUrl) score += 15;
    if (company?.logo) score += 15;

    return Math.min(100, score);
  }

  private calculateRecencyScore(activities: any[]): number {
    if (activities.length === 0) return 0;

    const lastActivity = activities[0];
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(lastActivity.createdAt).getTime()) / (24 * 60 * 60 * 1000),
    );

    if (daysSinceActivity <= 1) return 100;
    if (daysSinceActivity <= 7) return 80;
    if (daysSinceActivity <= 14) return 60;
    if (daysSinceActivity <= 30) return 40;
    if (daysSinceActivity <= 60) return 20;
    return 0;
  }

  async getSignalTypes() {
    return Object.entries(this.signalPatterns).map(([type, criteria]) => ({
      type,
      keywords: criteria.keywords,
      description: this.getSignalDescription(type),
      category: this.getSignalCategory(type),
    }));
  }

  private getSignalDescription(type: string): string {
    const descriptions: Record<string, string> = {
      HIRING_ENGINEERS: 'Company is hiring engineering talent',
      HIRING_SALES: 'Company is expanding sales team',
      HIRING_MARKETING: 'Company is building marketing team',
      HIRING_EXECUTIVE: 'Company is hiring executive leadership',
      FUNDING_RAISED: 'Company has raised funding',
      FUNDING_SEED: 'Company raised seed round',
      FUNDING_SERIES_A: 'Company raised Series A',
      FUNDING_SERIES_B: 'Company raised Series B',
      FUNDING_SERIES_C: 'Company raised later stage funding',
      TECHNOLOGY_ADDED: 'Company adopted new technology',
      TECHNOLOGY_REMOVED: 'Company stopped using technology',
      TECHNOLOGY_SWITCHED: 'Company switched technology providers',
      EXPANSION: 'Company is expanding operations',
      NEW_OFFICE: 'Company opened new office',
      MERGER: 'Company involved in merger',
      ACQUISITION: 'Company made acquisition',
      LEADERSHIP_CHANGE: 'Company has new leadership',
      PRODUCT_LAUNCH: 'Company launched new product',
      EVENT_PRESENCE: 'Company active at events',
      JOB_POSTING: 'Company has job postings',
      SOCIAL_GROWTH: 'Company has social media growth',
      NEWS_MENTION: 'Company mentioned in news',
    };
    return descriptions[type] || type;
  }

  private getSignalCategory(type: string): string {
    if (type.startsWith('HIRING_')) return 'hiring';
    if (type.startsWith('FUNDING_')) return 'funding';
    if (type.startsWith('TECHNOLOGY_')) return 'technology';
    return 'news';
  }
}
