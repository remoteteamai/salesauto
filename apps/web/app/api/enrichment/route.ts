import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'

// Mock data providers
const providers = [
  { id: 'clearbit', name: 'Clearbit', description: 'Firmographics & Tech', enabled: true, cost: 0.001 },
  { id: 'lusha', name: 'Lusha', description: 'Mobile Numbers', enabled: true, cost: 0.002 },
  { id: 'hunter', name: 'Hunter.io', description: 'Email Verification', enabled: true, cost: 0.0005 },
  { id: 'zoominfo', name: 'ZoomInfo', description: 'B2B Intel', enabled: false, cost: 0.003 },
  { id: 'apollo', name: 'Apollo', description: 'Contact Data', enabled: false, cost: 0.001 },
]

// Mock enrichment records
const enrichmentRecords = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'VP Marketing',
    company: 'Vercel',
    status: 'success',
    stage: 'Lusha',
    verifiedFields: ['email', 'phone', 'directDial'],
    enrichedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    title: 'CTO',
    company: 'Ramp',
    status: 'matching',
    stage: 'Clearbit',
    verifiedFields: [],
    enrichedAt: null,
  },
  {
    id: '3',
    name: 'Ananya Kapoor',
    title: 'Director of Sales',
    company: 'Gong',
    status: 'success',
    stage: 'Hunter',
    verifiedFields: ['email', 'verified'],
    enrichedAt: new Date().toISOString(),
  },
]

// Mock activity history
const activityHistory = [
  { id: '1', name: 'Salesforce Lead Sync', type: 'Sync', status: 'completed', leads: 42, time: 'Today, 10:45 AM' },
  { id: '2', name: 'Bulk Upload #4092', type: 'Upload', status: 'progress', leads: 850, time: 'Today, 09:12 AM' },
  { id: '3', name: 'Export: Sales_Qualified_Leads.csv', type: 'Download', status: 'completed', leads: 124, time: 'Yesterday, 4:30 PM' },
  { id: '4', name: 'HubSpot Contact Sync', type: 'Sync', status: 'failed', leads: 0, time: 'Oct 24, 11:15 AM' },
]

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  if (path.endsWith('/providers')) {
    return successResponse(providers)
  }
  
  if (path.endsWith('/records')) {
    return successResponse({
      records: enrichmentRecords,
      meta: {
        total: enrichmentRecords.length,
        completed: enrichmentRecords.filter(r => r.status === 'success').length,
        pending: enrichmentRecords.filter(r => r.status === 'matching').length,
      },
    })
  }
  
  if (path.endsWith('/activity')) {
    return successResponse(activityHistory)
  }

  return successResponse({ message: 'Enrichment API' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, data } = body

  if (action === 'upload') {
    return successResponse({
      batchId: 'BATCH_' + Date.now(),
      status: 'processing',
      totalRecords: data.records || 0,
      estimatedTime: '5-10 minutes',
    }, 201)
  }

  if (action === 'toggleProvider') {
    const { providerId, enabled } = data
    return successResponse({ message: `Provider ${enabled ? 'enabled' : 'disabled'}` })
  }

  if (action === 'sync') {
    const { target } = data
    return successResponse({
      message: `Sync to ${target} initiated`,
      syncId: 'SYNC_' + Date.now(),
      status: 'in_progress',
    })
  }

  if (action === 'export') {
    return successResponse({
      message: 'Export initiated',
      exportId: 'EXPORT_' + Date.now(),
      downloadUrl: '/api/enrichment/download/' + Date.now() + '.csv',
    })
  }

  return errorResponse('Invalid action')
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { recordId, action } = body

  if (recordId) {
    if (action === 'retry') {
      return successResponse({ message: 'Record retry initiated' })
    }

    if (action === 'dismiss') {
      return successResponse({ message: 'Record dismissed' })
    }
  }

  return errorResponse('Invalid request')
}
