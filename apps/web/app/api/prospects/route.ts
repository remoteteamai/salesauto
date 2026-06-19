import { NextRequest } from 'next/server'
import {
  successResponse,
  paginatedResponse,
} from '@/lib/api-response'
import {
  parsePaginationParams,
  paginateArray,
  buildPaginationMeta,
  filterBySearch,
  filterByField,
} from '@/lib/api-pagination'

// Mock data for prospects
const prospects = [
  {
    id: '1',
    company: 'Stripe',
    person: 'Sarah Jenkins',
    title: 'CTO',
    email: 'sarah.jenkins@stripe.com',
    logo: 'https://logo.clearbit.com/stripe.com',
    intentScore: 94,
    status: 'active',
    emailsSent: 12,
    openRate: 58,
    lastContacted: '2 hours ago',
  },
  {
    id: '2',
    company: 'Atlassian',
    person: 'David Chen',
    title: 'DevOps Manager',
    email: 'david.chen@atlassian.com',
    logo: 'https://logo.clearbit.com/atlassian.com',
    intentScore: 78,
    status: 'active',
    emailsSent: 8,
    openRate: 62,
    lastContacted: '1 day ago',
  },
  {
    id: '3',
    company: 'Zoom',
    person: 'Mark Thompson',
    title: 'Director of IT',
    email: 'mark.t@zoom.us',
    logo: 'https://logo.clearbit.com/zoom.us',
    intentScore: 89,
    status: 'active',
    emailsSent: 15,
    openRate: 47,
    lastContacted: '3 days ago',
  },
  {
    id: '4',
    company: 'Figma',
    person: 'Leila Voss',
    title: 'Product Lead',
    email: 'leila.voss@figma.com',
    logo: 'https://logo.clearbit.com/figma.com',
    intentScore: 42,
    status: 'inactive',
    emailsSent: 5,
    openRate: 40,
    lastContacted: '1 week ago',
  },
  {
    id: '5',
    company: 'GitHub',
    person: 'James Miller',
    title: 'VP Engineering',
    email: 'james.miller@github.com',
    logo: 'https://logo.clearbit.com/github.com',
    intentScore: 91,
    status: 'active',
    emailsSent: 20,
    openRate: 65,
    lastContacted: '4 hours ago',
  },
  {
    id: '6',
    company: 'Notion',
    person: 'Ivan Zhao',
    title: 'CEO',
    email: 'ivan@notion.so',
    logo: 'https://logo.clearbit.com/notion.so',
    intentScore: 85,
    status: 'active',
    emailsSent: 10,
    openRate: 70,
    lastContacted: '6 hours ago',
  },
  {
    id: '7',
    company: 'Linear',
    person: 'Karim Said',
    title: 'CTO',
    email: 'karim@linear.app',
    logo: 'https://logo.clearbit.com/linear.app',
    intentScore: 88,
    status: 'active',
    emailsSent: 7,
    openRate: 71,
    lastContacted: '1 day ago',
  },
  {
    id: '8',
    company: 'Vercel',
    person: 'Guillermo Rauch',
    title: 'CEO',
    email: 'guillermo@vercel.com',
    logo: 'https://logo.clearbit.com/vercel.com',
    intentScore: 76,
    status: 'active',
    emailsSent: 6,
    openRate: 67,
    lastContacted: '2 days ago',
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search')
  const status = searchParams.get('status')
  const pagination = parsePaginationParams(request)

  let filtered = filterBySearch(prospects, search, ['company', 'person', 'email'])
  filtered = filterByField(filtered, status, 'status')

  const paginated = paginateArray(filtered, pagination)
  const meta = buildPaginationMeta(filtered.length, pagination)

  return paginatedResponse(paginated, meta)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const newProspect = {
    id: String(Date.now()),
    ...body,
    status: 'active',
    emailsSent: 0,
    openRate: 0,
    lastContacted: 'Never',
  }

  return successResponse(newProspect, 201)
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { prospectId, action, data } = body

  if (action === 'update') {
    return successResponse({ message: 'Prospect updated', ...data })
  }

  if (action === 'delete') {
    return successResponse({ message: 'Prospect deleted' })
  }

  return successResponse({ message: 'Action completed' })
}
