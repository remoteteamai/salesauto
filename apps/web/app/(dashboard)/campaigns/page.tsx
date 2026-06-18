'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Play,
  Pause,
  Mail,
  Linkedin,
  Phone,
  BarChart3,
  TrendingUp,
  Users,
  MousePointer,
} from 'lucide-react'
import { formatNumber, formatPercentage } from '@/lib/utils'
import { format } from 'date-fns'

// Mock campaigns data
const mockCampaigns = [
  {
    id: '1',
    name: 'Enterprise Decision Makers',
    status: 'active',
    type: 'multi_channel',
    startDate: '2024-01-01',
    targetAudience: 'C-level, VP, Director at 500+ employee companies',
    metrics: {
      sent: 5420,
      openRate: 42.5,
      responseRate: 12.3,
      conversionRate: 4.8,
      meetings: 128,
    },
  },
  {
    id: '2',
    name: 'SaaS Companies Outreach',
    status: 'active',
    type: 'email',
    startDate: '2024-01-08',
    targetAudience: 'SaaS companies with 50-500 employees',
    metrics: {
      sent: 2850,
      openRate: 38.2,
      responseRate: 9.7,
      conversionRate: 3.2,
      meetings: 56,
    },
  },
  {
    id: '3',
    name: 'Tech Innovators 2024',
    status: 'paused',
    type: 'linkedin',
    startDate: '2023-12-15',
    targetAudience: 'Tech companies with recent funding',
    metrics: {
      sent: 1200,
      openRate: 35.8,
      responseRate: 8.4,
      conversionRate: 2.9,
      meetings: 24,
    },
  },
  {
    id: '4',
    name: 'Mid-Market Expansion',
    status: 'draft',
    type: 'cold_call',
    startDate: '2024-01-20',
    targetAudience: 'Mid-market companies in expansion phase',
    metrics: {
      sent: 0,
      openRate: 0,
      responseRate: 0,
      conversionRate: 0,
      meetings: 0,
    },
  },
  {
    id: '5',
    name: 'Q4 Win-back Campaign',
    status: 'completed',
    type: 'multi_channel',
    startDate: '2023-10-01',
    endDate: '2023-12-31',
    targetAudience: 'Companies that went dark in Q3',
    metrics: {
      sent: 1800,
      openRate: 45.2,
      responseRate: 15.8,
      conversionRate: 6.2,
      meetings: 45,
    },
  },
]

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  draft: 'secondary',
  active: 'success',
  paused: 'warning',
  completed: 'default',
}

const typeIcons: Record<string, typeof Mail> = {
  email: Mail,
  linkedin: Linkedin,
  cold_call: Phone,
  multi_channel: BarChart3,
}

export default function CampaignsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    return statusFilter === 'all' || campaign.status === statusFilter
  })

  const activeCampaigns = mockCampaigns.filter((c) => c.status === 'active')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Campaigns</h2>
          <p className="text-muted-foreground">
            Manage your outreach campaigns across all channels
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Set up a new outreach campaign to engage prospects
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input id="name" placeholder="Q1 Enterprise Outreach" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Channel</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="cold_call">Cold Call</SelectItem>
                      <SelectItem value="multi_channel">Multi-Channel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="Describe your ideal customer profile"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Create Campaign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockCampaigns.length} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(mockCampaigns.reduce((acc, c) => acc + c.metrics.sent, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">39.2%</div>
            <p className="text-xs text-muted-foreground">
              +5.3% vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meetings Booked</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(mockCampaigns.reduce((acc, c) => acc + c.metrics.meetings, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Campaigns</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="paused">Paused</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4">
            {filteredCampaigns.map((campaign) => {
              const TypeIcon = typeIcons[campaign.type] || Mail
              return (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <TypeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <CardDescription>{campaign.targetAudience}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusColors[campaign.status]}>
                          {campaign.status}
                        </Badge>
                        {campaign.status === 'active' && (
                          <Button variant="ghost" size="icon">
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {campaign.status === 'paused' && (
                          <Button variant="ghost" size="icon">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-6">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Sent</p>
                        <p className="text-lg font-semibold">
                          {formatNumber(campaign.metrics.sent)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Open Rate</p>
                        <p className="text-lg font-semibold">
                          {formatPercentage(campaign.metrics.openRate)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Response Rate</p>
                        <p className="text-lg font-semibold">
                          {formatPercentage(campaign.metrics.responseRate)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Conversion</p>
                        <p className="text-lg font-semibold">
                          {formatPercentage(campaign.metrics.conversionRate)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Meetings</p>
                        <p className="text-lg font-semibold">
                          {formatNumber(campaign.metrics.meetings)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Started</p>
                        <p className="text-lg font-semibold">
                          {format(new Date(campaign.startDate), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
