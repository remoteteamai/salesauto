import { NextRequest, NextResponse } from 'next/server'

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

// Connected integrations (would be stored in database)
const connectedIntegrations = ['salesforce', 'hubspot']

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  
  let filteredIntegrations = [...integrations]
  
  // Filter by category
  if (category) {
    filteredIntegrations = filteredIntegrations.filter(i => i.category === category)
  }
  
  // Filter featured only
  if (featured === 'true') {
    filteredIntegrations = filteredIntegrations.filter(i => i.featured)
  }
  
  // Add connected status
  const integrationsWithStatus = filteredIntegrations.map(i => ({
    ...i,
    connected: connectedIntegrations.includes(i.id),
  }))

  return NextResponse.json({
    success: true,
    data: integrationsWithStatus,
    meta: {
      total: integrationsWithStatus.length,
      connected: integrationsWithStatus.filter(i => i.connected).length,
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, integrationId, data } = body

  if (action === 'connect') {
    // Simulate OAuth flow
    return NextResponse.json({
      success: true,
      data: {
        integrationId,
        status: 'connected',
        authUrl: `https://oauth.example.com/authorize?client_id=${integrationId}`,
      },
    })
  }

  if (action === 'disconnect') {
    return NextResponse.json({
      success: true,
      message: 'Integration disconnected successfully',
    })
  }

  if (action === 'sync') {
    return NextResponse.json({
      success: true,
      data: {
        syncId: 'SYNC_' + Date.now(),
        status: 'in_progress',
        recordsProcessed: 0,
      },
    })
  }

  if (action === 'requestIntegration') {
    return NextResponse.json({
      success: true,
      message: 'Integration request submitted',
      data: {
        requestId: 'REQ_' + Date.now(),
      },
    })
  }

  return NextResponse.json({
    success: false,
    message: 'Invalid action',
  }, { status: 400 })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { integrationId, settings } = body

  return NextResponse.json({
    success: true,
    message: 'Integration settings updated',
    data: {
      integrationId,
      settings,
    },
  })
}