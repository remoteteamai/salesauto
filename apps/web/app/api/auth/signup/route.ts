import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.BACKEND_URL || 'http://localhost:3001/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, company } = body
    const [firstName, ...lastParts] = (name || '').split(' ')
    const lastName = lastParts.join(' ') || firstName

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Registration failed' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      token: data.token,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Authentication service unavailable' },
      { status: 503 }
    )
  }
}
