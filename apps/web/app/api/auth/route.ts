import { NextRequest, NextResponse } from 'next/server'

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

// Mock API keys — only masked prefixes are returned; full keys are never stored in source
const mockApiKeys = [
  {
    id: 'key_1',
    name: 'Production API Key',
    key: 'sk_live_••••••••••••••',
    createdAt: '2024-10-01',
    lastUsed: '2 hours ago',
  },
  {
    id: 'key_2',
    name: 'Development API Key',
    key: 'sk_test_••••••••••••••',
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
  
  // User profile
  if (path.endsWith('/me')) {
    return NextResponse.json({
      success: true,
      data: mockUser,
    })
  }
  
  // API keys
  if (path.endsWith('/api-keys')) {
    return NextResponse.json({
      success: true,
      data: mockApiKeys,
    })
  }
  
  // Integrations
  if (path.endsWith('/integrations')) {
    return NextResponse.json({
      success: true,
      data: mockIntegrations,
    })
  }

  return NextResponse.json({
    success: true,
    data: { message: 'Auth API' },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action } = body

  if (action === 'login') {
    // Mock login
    return NextResponse.json({
      success: true,
      data: {
        user: mockUser,
        token: 'mock_jwt_token_' + Date.now(),
      },
    })
  }

  if (action === 'logout') {
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  }

  if (action === 'register') {
    return NextResponse.json({
      success: true,
      data: {
        user: { ...mockUser, ...body },
        token: 'mock_jwt_token_' + Date.now(),
      },
    }, { status: 201 })
  }

  if (action === 'generate-api-key') {
    const newKey = {
      id: 'key_' + Date.now(),
      name: body.name || 'New API Key',
      key: 'sk_live_••••••••••••••',
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    }
    return NextResponse.json({
      success: true,
      data: newKey,
    }, { status: 201 })
  }

  return NextResponse.json({
    success: false,
    message: 'Invalid action',
  }, { status: 400 })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  
  // Update profile
  if (body.profile) {
    return NextResponse.json({
      success: true,
      data: { ...mockUser, ...body.profile },
      message: 'Profile updated',
    })
  }

  // Update notifications
  if (body.notifications) {
    return NextResponse.json({
      success: true,
      message: 'Notifications updated',
    })
  }

  // Change password
  if (body.currentPassword && body.newPassword) {
    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    })
  }

  return NextResponse.json({
    success: false,
    message: 'Invalid update',
  }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const keyId = searchParams.get('apiKeyId')

  if (keyId) {
    return NextResponse.json({
      success: true,
      message: 'API key deleted',
    })
  }

  return NextResponse.json({
    success: false,
    message: 'Invalid delete request',
  }, { status: 400 })
}