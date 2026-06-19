import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'

// Mock integrations data
const integrations = [
  { id: 'salesforce', name: 'Salesforce', category: 'crm', featured: true, connected: true },
  { id: 'hubspot', name: 'HubSpot', category: 'crm', featured: true, connected: true },
  { id: 'pipedrive', name: 'Pipedrive', category: 'crm', connected: false },
  { id: 'dynamics', name: 'MS Dynamics 365', category: 'crm', connected: false },
  { id: 'zendesk', name: 'Zendesk Sell', category: 'crm', connected: false },
  { id: 'outreach', name: 'Outreach.io', category: 'sales', connected: false },
  { id: 'salesloft', name: 'Salesloft', category: 'sales', connected: false },
  { id: 'instantly', name: 'Instantly', category: 'sales', connected: false },
  { id: 'clearbit', name: 'Clearbit', category: 'data', connected: false },
  { id: '6sense', name: '6sense', category: 'data', connected: false },
  { id: 'apollo', name: 'Apollo.io', category: 'data', connected: false },
  { id: 'mailchimp', name: 'Mailchimp', category: 'email', connected: false },
  { id: 'sendgrid', name: 'SendGrid', category: 'email', connected: false },
  { id: 'slack', name: 'Slack', category: 'ops', connected: false },
  { id: 'zapier', name: 'Zapier', category: 'ops', connected: false },
]

const connectedIntegrations = ['salesforce', 'hubspot']

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  
  let filtered = [...integrations]
  
  if (category) {
    filtered = filtered.filter(i => i.category === category)
  }
  
  if (featured === 'true') {
    filtered = filtered.filter(i => i.featured)
  }
  
  const withStatus = filtered.map(i => ({
    ...i,
    connected: connectedIntegrations.includes(i.id),
  }))

  return successResponse({
    integrations: withStatus,
    meta: {
      total: withStatus.length,
      connected: withStatus.filter(i => i.connected).length,
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, integrationId, data } = body

  if (action === 'connect') {
    return successResponse({
      integrationId,
      status: 'connected',
      authUrl: `https://oauth.example.com/authorize?client_id=${integrationId}`,
    })
  }

  if (action === 'disconnect') {
    return successResponse({ message: 'Integration disconnected successfully' })
  }

  if (action === 'sync') {
    return successResponse({
      syncId: 'SYNC_' + Date.now(),
      status: 'in_progress',
      recordsProcessed: 0,
    })
  }

  if (action === 'requestIntegration') {
    return successResponse({
      message: 'Integration request submitted',
      requestId: 'REQ_' + Date.now(),
    })
  }

  return errorResponse('Invalid action')
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { integrationId, settings } = body

  return successResponse({
    message: 'Integration settings updated',
    integrationId,
    settings,
  })
}
