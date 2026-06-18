import { supabase, isSupabaseConfigured } from './supabase'
import { authService } from './auth'

// Types
export interface Prospect {
  id: string
  company: string
  person: string
  title: string
  email: string
  phone?: string
  linkedin?: string
  logo?: string
  intentScore: number
  status: 'active' | 'inactive' | 'converted' | 'lost'
  emailsSent: number
  openRate: number
  lastContacted: string
  source?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
const USE_BACKEND = !!API_URL

// API helper
async function apiFetch(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }
  return response.json()
}

export interface Sequence {
  id: string
  name: string
  description: string
  steps: SequenceStep[]
  status: 'draft' | 'active' | 'paused' | 'completed'
  totalRecipients: number
  sent: number
  opened: number
  replied: number
  converted: number
  createdAt: string
}

export interface SequenceStep {
  id: string
  order: number
  type: 'email' | 'linkedin' | 'call' | 'task'
  subject?: string
  body: string
  delayDays: number
}

export interface Alert {
  id: string
  type: 'hiring' | 'funding' | 'technology' | 'website' | 'news'
  company: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  source: string
  url?: string
  read: boolean
  createdAt: string
}

export interface Campaign {
  id: string
  name: string
  type: 'email' | 'linkedin' | 'multi-channel'
  status: 'draft' | 'active' | 'paused' | 'completed'
  budget: number
  spent: number
  leads: number
  conversions: number
  roi: number
  startDate: string
  endDate?: string
}

export interface AnalyticsData {
  meetingsBooked: number
  pipelineCreated: number
  revenueAttributed: number
  activeProspects: number
  emailOpenRate: number
  responseRate: number
}

// Mock data
const MOCK_PROSPECTS: Prospect[] = [
  {
    id: '1',
    company: 'Stripe',
    person: 'Sarah Jenkins',
    title: 'CTO',
    email: 'sarah.jenkins@stripe.com',
    logo: 'https://logo.clearbit.com/stripe.com',
    intentScore: 94,
    status: 'active',
    emailsSent: 12,
    openRate: 58,
    lastContacted: '2 hours ago',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    company: 'Atlassian',
    person: 'David Chen',
    title: 'DevOps Manager',
    email: 'david.chen@atlassian.com',
    logo: 'https://logo.clearbit.com/atlassian.com',
    intentScore: 78,
    status: 'active',
    emailsSent: 8,
    openRate: 62,
    lastContacted: '1 day ago',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    company: 'Zoom',
    person: 'Mark Thompson',
    title: 'Director of IT',
    email: 'mark.t@zoom.us',
    logo: 'https://logo.clearbit.com/zoom.us',
    intentScore: 89,
    status: 'active',
    emailsSent: 15,
    openRate: 47,
    lastContacted: '3 days ago',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    company: 'Figma',
    person: 'Leila Voss',
    title: 'Product Lead',
    email: 'leila.voss@figma.com',
    logo: 'https://logo.clearbit.com/figma.com',
    intentScore: 42,
    status: 'inactive',
    emailsSent: 5,
    openRate: 40,
    lastContacted: '1 week ago',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    company: 'GitHub',
    person: 'James Miller',
    title: 'VP Engineering',
    email: 'james.miller@github.com',
    logo: 'https://logo.clearbit.com/github.com',
    intentScore: 91,
    status: 'active',
    emailsSent: 20,
    openRate: 65,
    lastContacted: '4 hours ago',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const MOCK_SEQUENCES: Sequence[] = [
  {
    id: '1',
    name: 'Enterprise Outreach',
    description: 'Multi-touch sequence for enterprise prospects',
    steps: [
      { id: 's1', order: 1, type: 'email', subject: 'Quick question about {{company}}', body: 'Hi {{name}}, I noticed {{company}} is growing rapidly...', delayDays: 0 },
      { id: 's2', order: 2, type: 'linkedin', body: 'Connected with {{name}} on LinkedIn', delayDays: 2 },
      { id: 's3', order: 3, type: 'email', subject: 'Re: Quick question', body: 'Following up on my previous email...', delayDays: 5 },
    ],
    status: 'active',
    totalRecipients: 245,
    sent: 189,
    opened: 94,
    replied: 23,
    converted: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Cold Email Series',
    description: 'Basic cold email sequence',
    steps: [
      { id: 's1', order: 1, type: 'email', subject: 'Hi {{name}}', body: 'Hello, I wanted to reach out...', delayDays: 0 },
      { id: 's2', order: 2, type: 'email', subject: 'Following up', body: 'Just wanted to make sure you saw my email...', delayDays: 3 },
    ],
    status: 'active',
    totalRecipients: 512,
    sent: 412,
    opened: 156,
    replied: 34,
    converted: 12,
    createdAt: new Date().toISOString(),
  },
]

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'hiring',
    company: 'Stripe',
    title: 'New VP of Sales Hire',
    description: 'Stripe just hired a new VP of Sales with enterprise experience',
    severity: 'high',
    source: 'LinkedIn',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    type: 'funding',
    company: 'Notion',
    title: '$50M Series C Closed',
    description: 'Notion raised $50M in Series C funding led by Sequoia',
    severity: 'high',
    source: 'TechCrunch',
    url: 'https://techcrunch.com',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    type: 'technology',
    company: 'Figma',
    title: 'Started using Segment',
    description: 'Figma added Segment to their tech stack',
    severity: 'medium',
    source: 'BuiltWith',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
]

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Q1 Enterprise Push',
    type: 'multi-channel',
    status: 'active',
    budget: 10000,
    spent: 4250,
    leads: 156,
    conversions: 12,
    roi: 340,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
  },
  {
    id: '2',
    name: 'LinkedIn Outreach',
    type: 'linkedin',
    status: 'active',
    budget: 5000,
    spent: 2100,
    leads: 89,
    conversions: 7,
    roi: 280,
    startDate: '2024-02-01',
  },
]

// Data service with Supabase backend
class DataService {
  // Prospects
  async getProspects(filters?: { search?: string; status?: string }): Promise<Prospect[]> {
    // Try backend API first
    if (USE_BACKEND) {
      try {
        const params = new URLSearchParams()
        if (filters?.search) params.append('search', filters.search)
        if (filters?.status) params.append('status', filters.status)
        const data = await apiFetch(`/api/prospects?${params}`)
        return data.data || MOCK_PROSPECTS
      } catch (e) {
        console.warn('Backend unavailable, using mock data:', e)
      }
    }

    // Fall back to Supabase
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('intent_score', { ascending: false })

      if (!error && data) {
        return data.map(p => ({
          id: p.id,
          company: p.company_name,
          person: p.person_name,
          title: p.title,
          email: p.email,
          phone: p.phone,
          linkedin: p.linkedin_url,
          intentScore: p.intent_score,
          status: p.status,
          emailsSent: p.emails_sent,
          openRate: p.open_rate,
          lastContacted: p.last_contacted,
          source: p.source,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }))
      }
    }

    // Use mock data
    let prospects = [...MOCK_PROSPECTS]
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      prospects = prospects.filter(p => 
        p.company.toLowerCase().includes(search) ||
        p.person.toLowerCase().includes(search)
      )
    }
    if (filters?.status && filters.status !== 'all') {
      prospects = prospects.filter(p => p.status === filters.status)
    }
    return prospects
  }

  async createProspect(prospect: Partial<Prospect>): Promise<Prospect | null> {
    if (!isSupabaseConfigured) {
      const newProspect: Prospect = {
        id: String(Date.now()),
        company: prospect.company || '',
        person: prospect.person || '',
        title: prospect.title || '',
        email: prospect.email || '',
        intentScore: 0,
        status: 'active',
        emailsSent: 0,
        openRate: 0,
        lastContacted: 'Never',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...prospect,
      }
      MOCK_PROSPECTS.push(newProspect)
      return newProspect
    }

    const { data, error } = await supabase
      .from('prospects')
      .insert([prospect])
      .select()
      .single()

    if (error) {
      console.error('Error creating prospect:', error)
      return null
    }

    return data
  }

  async updateProspect(id: string, updates: Partial<Prospect>): Promise<Prospect | null> {
    if (!isSupabaseConfigured) {
      const index = MOCK_PROSPECTS.findIndex(p => p.id === id)
      if (index !== -1) {
        MOCK_PROSPECTS[index] = { ...MOCK_PROSPECTS[index], ...updates }
        return MOCK_PROSPECTS[index]
      }
      return null
    }

    const { data, error } = await supabase
      .from('prospects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating prospect:', error)
      return null
    }

    return data
  }

  async deleteProspect(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const index = MOCK_PROSPECTS.findIndex(p => p.id === id)
      if (index !== -1) {
        MOCK_PROSPECTS.splice(index, 1)
        return true
      }
      return false
    }

    const { error } = await supabase
      .from('prospects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting prospect:', error)
      return false
    }

    return true
  }

  // Sequences
  async getSequences(): Promise<Sequence[]> {
    if (!isSupabaseConfigured) {
      return MOCK_SEQUENCES
    }

    const { data, error } = await supabase
      .from('sequences')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sequences:', error)
      return MOCK_SEQUENCES
    }

    return data
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    if (!isSupabaseConfigured) {
      return MOCK_ALERTS
    }

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching alerts:', error)
      return MOCK_ALERTS
    }

    return data
  }

  async markAlertRead(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const alert = MOCK_ALERTS.find(a => a.id === id)
      if (alert) {
        alert.read = true
        return true
      }
      return false
    }

    const { error } = await supabase
      .from('alerts')
      .update({ read: true })
      .eq('id', id)

    return !error
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    if (!isSupabaseConfigured) {
      return MOCK_CAMPAIGNS
    }

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
      return MOCK_CAMPAIGNS
    }

    return data
  }

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const mockAnalytics: AnalyticsData = {
      meetingsBooked: 127,
      pipelineCreated: 2450000,
      revenueAttributed: 890000,
      activeProspects: 423,
      emailOpenRate: 42,
      responseRate: 18,
    }

    if (!isSupabaseConfigured) {
      return mockAnalytics
    }

    const { data, error } = await supabase
      .from('analytics_daily')
      .select('*')
      .order('date', { ascending: false })
      .limit(30)

    if (error) {
      console.error('Error fetching analytics:', error)
      return mockAnalytics
    }

    // Aggregate data
    return {
      meetingsBooked: data?.reduce((sum, d) => sum + (d.meetings_booked || 0), 0) || 127,
      pipelineCreated: data?.reduce((sum, d) => sum + (d.pipeline_created || 0), 0) || 2450000,
      revenueAttributed: data?.reduce((sum, d) => sum + (d.revenue_attributed || 0), 0) || 890000,
      activeProspects: data?.reduce((sum, d) => sum + (d.active_prospects || 0), 0) || 423,
      emailOpenRate: data?.reduce((sum, d) => sum + (d.email_open_rate || 0), 0) / (data?.length || 1) || 42,
      responseRate: data?.reduce((sum, d) => sum + (d.response_rate || 0), 0) / (data?.length || 1) || 18,
    }
  }
}

export const dataService = new DataService()
