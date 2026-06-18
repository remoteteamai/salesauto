import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface Prospect {
  id: string
  name: string
  email: string
  company: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  stage: string
  value: number
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: string
  name: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  type: 'email' | 'linkedin' | 'cold_call' | 'multi_channel'
  targetAudience: string
  sentCount: number
  openRate: number
  responseRate: number
  conversionRate: number
  startDate: string
  endDate?: string
}

export interface Meeting {
  id: string
  title: string
  prospectName: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
}

export interface DashboardMetrics {
  totalMeetings: number
  meetingsChange: number
  pipelineValue: number
  pipelineChange: number
  revenue: number
  revenueChange: number
  conversionRate: number
  conversionChange: number
}

export interface Activity {
  id: string
  type: 'meeting' | 'email' | 'call' | 'note' | 'deal'
  title: string
  description: string
  timestamp: string
}

export interface PipelineStage {
  stage: string
  count: number
  value: number
}

export interface CampaignPerformance {
  date: string
  emails: number
  responses: number
  meetings: number
}

export async function getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
  const response = await api.get('/dashboard/metrics')
  return response.data
}

export async function getPipelineData(): Promise<ApiResponse<PipelineStage[]>> {
  const response = await api.get('/dashboard/pipeline')
  return response.data
}

export async function getRecentActivity(): Promise<ApiResponse<Activity[]>> {
  const response = await api.get('/dashboard/activity')
  return response.data
}

export async function getCampaignPerformance(): Promise<ApiResponse<CampaignPerformance[]>> {
  const response = await api.get('/dashboard/campaign-performance')
  return response.data
}

export async function getProspects(params?: {
  page?: number
  pageSize?: number
  status?: string
  search?: string
}): Promise<ApiResponse<PaginatedResponse<Prospect>>> {
  const response = await api.get('/prospects', { params })
  return response.data
}

export async function getCampaigns(params?: {
  page?: number
  pageSize?: number
  status?: string
}): Promise<ApiResponse<PaginatedResponse<Campaign>>> {
  const response = await api.get('/campaigns', { params })
  return response.data
}

export async function login(email: string, password: string): Promise<ApiResponse<{ token: string; user: unknown }>> {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function signup(data: { email: string; password: string; name: string; company?: string }): Promise<ApiResponse<{ token: string; user: unknown }>> {
  const response = await api.post('/auth/signup', data)
  return response.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
  localStorage.removeItem('auth_token')
}

export default api
