import { supabase, isSupabaseConfigured } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

// Types
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  organizationId?: string
  organizationName?: string
}

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  companyName?: string
}

export interface SignInData {
  email: string
  password: string
}

// Mock users for demo mode
const MOCK_USERS: AuthUser[] = [
  {
    id: '1',
    email: 'demo@melioro.ai',
    firstName: 'Demo',
    lastName: 'User',
    organizationId: 'org_1',
    organizationName: 'Melioro Demo',
  },
]

// Demo mode authentication (when Supabase is not configured)
class MockAuthService {
  private currentUser: AuthUser | null = MOCK_USERS[0]

  async signUp(_data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
    return { user: this.currentUser, error: null }
  }

  async signIn(_data: SignInData): Promise<{ user: AuthUser | null; error: string | null }> {
    return { user: this.currentUser, error: null }
  }

  async signOut(): Promise<{ error: string | null }> {
    this.currentUser = null
    return { error: null }
  }

  async getUser(): Promise<AuthUser | null> {
    return this.currentUser
  }

  async updateUser(updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: string | null }> {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...updates }
    }
    return { user: this.currentUser, error: null }
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }
}

// Supabase authentication service
class SupabaseAuthService {
  async signUp(data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            companyName: data.companyName,
          },
        },
      })

      if (error) return { user: null, error: error.message }

      if (authData.user) {
        const user: AuthUser = {
          id: authData.user.id,
          email: authData.user.email || data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        }
        return { user, error: null }
      }

      return { user: null, error: 'Signup failed' }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      return { user: null, error: message }
    }
  }

  async signIn(data: SignInData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) return { user: null, error: error.message }

      if (authData.user) {
        const user: AuthUser = {
          id: authData.user.id,
          email: authData.user.email || data.email,
          firstName: authData.user.user_metadata?.firstName || '',
          lastName: authData.user.user_metadata?.lastName || '',
          avatar: authData.user.user_metadata?.avatar,
        }
        return { user, error: null }
      }

      return { user: null, error: 'Signin failed' }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      return { user: null, error: message }
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signOut()
    return { error: error?.message || null }
  }

  async getUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    return {
      id: user.id,
      email: user.email || '',
      firstName: user.user_metadata?.firstName || '',
      lastName: user.user_metadata?.lastName || '',
      avatar: user.user_metadata?.avatar,
      organizationId: user.user_metadata?.organizationId,
      organizationName: user.user_metadata?.organizationName,
    }
  }

  async updateUser(updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.updateUser({
        data: updates,
      })

      if (error) return { user: null, error: error.message }
      if (!user) return { user: null, error: 'Update failed' }

      return {
        user: {
          id: user.id,
          email: user.email || '',
          firstName: user.user_metadata?.firstName || '',
          lastName: user.user_metadata?.lastName || '',
          avatar: user.user_metadata?.avatar,
        },
        error: null,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      return { user: null, error: message }
    }
  }

  isAuthenticated(): boolean {
    return true // Will be handled by state
  }

  // OAuth methods
  async signInWithGoogle(): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error: error?.message || null }
  }

  async signInWithMicrosoft(): Promise<{ error: string | null }> {
    return { error: 'Microsoft sign-in requires Supabase configuration.' }
  }
}

// Export the appropriate service based on configuration
export const authService = isSupabaseConfigured 
  ? new SupabaseAuthService() 
  : new MockAuthService()

export { MockAuthService, SupabaseAuthService }
