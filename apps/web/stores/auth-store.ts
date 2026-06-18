import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  company?: string
  role: 'admin' | 'manager' | 'sales_rep'
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: { email: string; password: string; name: string; company?: string }) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          
          if (!response.ok) {
            throw new Error('Login failed')
          }
          
          const data = await response.json()
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', data.token)
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signup: async (data: { email: string; password: string; name: string; company?: string }) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          
          if (!response.ok) {
            throw new Error('Signup failed')
          }
          
          const result = await response.json()
          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', result.token)
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
        }
      },

      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token, isAuthenticated: !!token })
        if (typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem('auth_token', token)
          } else {
            localStorage.removeItem('auth_token')
          }
        }
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)
