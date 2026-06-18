import { NextRequest, NextResponse } from 'next/server'

// Mock data for sequences
const sequences = [
  {
    id: '1',
    name: 'Enterprise Outreach Q4',
    type: 'email',
    steps: 8,
    status: 'active',
    activeContacts: 245,
    totalContacts: 500,
    openRate: 42,
    responseRate: 18,
    createdAt: '2024-10-01',
  },
  {
    id: '2',
    name: 'LinkedIn Connection Sequence',
    type: 'linkedin',
    steps: 5,
    status: 'active',
    activeContacts: 128,
    totalContacts: 200,
    openRate: 65,
    responseRate: 25,
    createdAt: '2024-10-15',
  },
  {
    id: '3',
    name: 'Demo Request Follow-up',
    type: 'multi',
    steps: 6,
    status: 'paused',
    activeContacts: 45,
    totalContacts: 100,
    openRate: 55,
    responseRate: 22,
    createdAt: '2024-09-20',
  },
  {
    id: '4',
    name: 'Cold Email Series',
    type: 'email',
    steps: 4,
    status: 'active',
    activeContacts: 312,
    totalContacts: 800,
    openRate: 38,
    responseRate: 12,
    createdAt: '2024-08-10',
  },
  {
    id: '5',
    name: 'Webinar Promotion',
    type: 'email',
    steps: 3,
    status: 'draft',
    activeContacts: 0,
    totalContacts: 1000,
    openRate: 0,
    responseRate: 0,
    createdAt: '2024-10-20',
  },
  {
    id: '6',
    name: 'Multi-Channel Enterprise',
    type: 'multi',
    steps: 10,
    status: 'active',
    activeContacts: 89,
    totalContacts: 150,
    openRate: 58,
    responseRate: 28,
    createdAt: '2024-09-05',
  },
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search')
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  let filteredSequences = [...sequences]

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase()
    filteredSequences = filteredSequences.filter(s => 
      s.name.toLowerCase().includes(searchLower))
  }

  // Filter by status
  if (status && status !== 'all') {
    filteredSequences = filteredSequences.filter(s => s.status === status)
  }

  // Filter by type
  if (type && type !== 'all') {
    filteredSequences = filteredSequences.filter(s => s.type === type)
  }

  // Pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedSequences = filteredSequences.slice(startIndex, endIndex)

  // Calculate stats
  const stats = {
    total: sequences.length,
    active: sequences.filter(s => s.status === 'active').length,
    paused: sequences.filter(s => s.status === 'paused').length,
    draft: sequences.filter(s => s.status === 'draft').length,
    totalContacts: sequences.reduce((acc, s) => acc + s.activeContacts, 0),
    avgResponseRate: Math.round(
      sequences.reduce((acc, s) => acc + s.responseRate, 0) / sequences.length
    ),
  }

  return NextResponse.json({
    success: true,
    data: paginatedSequences,
    stats,
    meta: {
      page,
      limit,
      total: filteredSequences.length,
      totalPages: Math.ceil(filteredSequences.length / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Create new sequence
  const newSequence = {
    id: String(Date.now()),
    ...body,
    activeContacts: 0,
    totalContacts: 0,
    openRate: 0,
    responseRate: 0,
    createdAt: new Date().toISOString().split('T')[0],
  }

  return NextResponse.json({
    success: true,
    data: newSequence,
  }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { sequenceId, action, data } = body

  if (action === 'update') {
    return NextResponse.json({
      success: true,
      message: 'Sequence updated',
      data,
    })
  }

  if (action === 'pause') {
    return NextResponse.json({
      success: true,
      message: 'Sequence paused',
    })
  }

  if (action === 'resume') {
    return NextResponse.json({
      success: true,
      message: 'Sequence resumed',
    })
  }

  if (action === 'delete') {
    return NextResponse.json({
      success: true,
      message: 'Sequence deleted',
    })
  }

  return NextResponse.json({
    success: true,
    message: 'Action completed',
  })
}