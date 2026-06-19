import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'

// Mock user data
const mockUser = {
  id: '1',
  name: 'Alex Rivera',
  email: 'alex@melioro.ai',
  company: 'Melioro AI',
  role: 'Enterprise Account',
  avatar: null,
  plan: 'enterprise',
}

// Mock API keys
const mockApiKeys = [
  {
    id: 'key_1',
    name: 'Production API Key',
    key: 'sk_live_xxxxxxxxxxxxx',
    createdAt: '2024-10-01',
    lastUsed: '2 hours ago',
  },
  {
    id: 'key_2',
    name: 'Development API Key',
    key: 'sk_test_xxxxxxxxxxxxx',
    createdAt: '2024-09-15',
    lastUsed: '1 day ago',
  },
]

// Mock integrations
const mockIntegrations = [
  { id: '1', name: 'LinkedIn', connected: true, icon: 'linkedin' },
  { id: '2', name: 'Salesforce', connected: true, icon: 'cloud' },
  { id: '3', name: 'Google Calendar', connected: true, icon: 'calendar' },
  { id: '4', name: 'Slack', connected: false, icon: 'message-square' },
  { id: '5', name: 'HubSpot', connected: false, icon: 'database' },
]

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  if (path.endsWith('/me')) {
    return successResponse(mockUser)
  }
  
  if (path.endsWith('/api-keys')) {
    return successResponse(mockApiKeys)
  }
  
  if (path.endsWith('/integrations')) {
    return successResponse(mockIntegrations)
  }

  return successResponse({ message: 'Auth API' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action } = body

  if (action === 'login') {
    return successResponse({
      user: mockUser,
      token: 'mock_jwt_token_' + Date.now(),
    })
  }

  if (action === 'logout') {
    return successResponse({ message: 'Logged out successfully' })
  }

  if (action === 'register') {
    return successResponse({
      user: { ...mockUser, ...body },
      token: 'mock_jwt_token_' + Date.now(),
    }, 201)
  }

  if (action === 'generate-api-key') {
    const newKey = {
      id: 'key_' + Date.now(),
      name: body.name || 'New API Key',
      key: 'sk_live_' + Array.from({length: 24}, () => 
        Math.random().toString(36).charAt(2)).join(''),
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    }
    return successResponse(newKey, 201)
  }

  return errorResponse('Invalid action')
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  
  if (body.profile) {
    return successResponse({ ...mockUser, ...body.profile })
  }

  if (body.notifications) {
    return successResponse({ message: 'Notifications updated' })
  }

  if (body.currentPassword && body.newPassword) {
    return successResponse({ message: 'Password changed successfully' })
  }

  return errorResponse('Invalid update')
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const keyId = searchParams.get('apiKeyId')

  if (keyId) {
    return successResponse({ message: 'API key deleted' })
  }

  return errorResponse('Invalid delete request')
}
