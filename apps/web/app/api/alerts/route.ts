import { NextRequest, NextResponse } from 'next/server'

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
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  let filteredAlerts = [...alerts]

  // Filter by alert name
  if (alertName && alertName !== 'All') {
    filteredAlerts = filteredAlerts.filter(a => a.name === alertName)
  }

  // Filter by minimum score
  if (minScore) {
    const minScoreNum = parseInt(minScore.replace('> ', ''))
    filteredAlerts = filteredAlerts.filter(a => a.intentScore >= minScoreNum)
  }

  // Pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex)

  // Calculate stats
  const stats = {
    total: alerts.length,
    unread: alerts.filter(a => a.isUnread).length,
    filtered: filteredAlerts.length,
  }

  return NextResponse.json({
    success: true,
    data: paginatedAlerts,
    stats,
    meta: {
      page,
      limit,
      total: filteredAlerts.length,
      totalPages: Math.ceil(filteredAlerts.length / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Create new alert
  const newAlert = {
    id: String(Date.now()),
    ...body,
    timestamp: new Date().toISOString(),
    isUnread: true,
  }

  return NextResponse.json({
    success: true,
    data: newAlert,
  }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { alertId, action } = body

  // Update alert status
  if (action === 'markRead') {
    return NextResponse.json({
      success: true,
      message: 'Alert marked as read',
    })
  }

  if (action === 'dismiss') {
    return NextResponse.json({
      success: true,
      message: 'Alert dismissed',
    })
  }

  return NextResponse.json({
    success: true,
    message: 'Alert updated',
  })
}