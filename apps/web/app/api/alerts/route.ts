import { NextRequest } from 'next/server'
import {
  successResponse,
  paginatedResponse,
} from '@/lib/api-response'
import {
  parsePaginationParams,
  paginateArray,
  buildPaginationMeta,
} from '@/lib/api-pagination'

// Mock data for alerts
const alerts = [
  {
    id: '1',
    name: 'High Intent Tech Leads',
    type: 'Website Visit',
    icon: 'language',
    company: 'Stripe',
    person: 'Sarah Jenkins',
    title: 'CTO',
    logo: 'https://logo.clearbit.com/stripe.com',
    intentScore: 94,
    timestamp: new Date().toISOString(),
    isUnread: true,
  },
  {
    id: '2',
    name: 'Bombora Surge Alert',
    type: 'Topic: Cloud Security',
    icon: 'trending_up',
    company: 'Atlassian',
    person: 'David Chen',
    title: 'DevOps Manager',
    logo: 'https://logo.clearbit.com/atlassian.com',
    intentScore: 78,
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    isUnread: false,
  },
  {
    id: '3',
    name: 'Competitor Pricing Page',
    type: 'G2 Comparison',
    icon: 'group_work',
    company: 'Zoom',
    person: 'Mark Thompson',
    title: 'Director of IT',
    logo: 'https://logo.clearbit.com/zoom.us',
    intentScore: 89,
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    isUnread: true,
  },
  {
    id: '4',
    name: 'Direct Website Visit',
    type: 'Home Page',
    icon: 'link',
    company: 'Figma',
    person: 'Leila Voss',
    title: 'Product Lead',
    logo: 'https://logo.clearbit.com/figma.com',
    intentScore: 42,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isUnread: false,
  },
  {
    id: '5',
    name: 'Job Change Alert',
    type: 'New Position',
    icon: 'work',
    company: 'GitHub',
    person: 'James Miller',
    title: 'VP Engineering',
    logo: 'https://logo.clearbit.com/github.com',
    intentScore: 91,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isUnread: true,
  },
  {
    id: '6',
    name: 'Funding Announcement',
    type: 'Series C',
    icon: 'payments',
    company: 'Notion',
    person: 'Ivan Zhao',
    title: 'CEO',
    logo: 'https://logo.clearbit.com/notion.so',
    intentScore: 85,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isUnread: false,
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const alertName = searchParams.get('alertName')
  const minScore = searchParams.get('minScore')
  const pagination = parsePaginationParams(request)

  let filtered = [...alerts]

  if (alertName && alertName !== 'All') {
    filtered = filtered.filter(a => a.name === alertName)
  }

  if (minScore) {
    const minScoreNum = parseInt(minScore.replace('> ', ''))
    filtered = filtered.filter(a => a.intentScore >= minScoreNum)
  }

  const paginated = paginateArray(filtered, pagination)
  const meta = buildPaginationMeta(filtered.length, pagination)

  const stats = {
    total: alerts.length,
    unread: alerts.filter(a => a.isUnread).length,
    filtered: filtered.length,
  }

  return paginatedResponse(paginated, meta, { stats })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const newAlert = {
    id: String(Date.now()),
    ...body,
    timestamp: new Date().toISOString(),
    isUnread: true,
  }

  return successResponse(newAlert, 201)
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { alertId, action } = body

  if (action === 'markRead') {
    return successResponse({ message: 'Alert marked as read' })
  }

  if (action === 'dismiss') {
    return successResponse({ message: 'Alert dismissed' })
  }

  return successResponse({ message: 'Alert updated' })
}
