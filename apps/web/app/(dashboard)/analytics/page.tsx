'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Mail,
  Phone,
  Calendar,
  MousePointer,
  BarChart3,
} from 'lucide-react'
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'

const monthlyData = [
  { month: 'Jul', revenue: 450000, deals: 28, conversion: 22 },
  { month: 'Aug', revenue: 520000, deals: 32, conversion: 24 },
  { month: 'Sep', revenue: 580000, deals: 35, conversion: 25 },
  { month: 'Oct', revenue: 620000, deals: 38, conversion: 26 },
  { month: 'Nov', revenue: 710000, deals: 42, conversion: 27 },
  { month: 'Dec', revenue: 820000, deals: 48, conversion: 28 },
  { month: 'Jan', revenue: 892000, deals: 52, conversion: 29 },
]

const channelData = [
  { name: 'Email', value: 45, color: '#3b82f6' },
  { name: 'LinkedIn', value: 28, color: '#0A66C2' },
  { name: 'Cold Call', value: 18, color: '#10b981' },
  { name: 'Referral', value: 9, color: '#8b5cf6' },
]

const funnelData = [
  { stage: 'Prospects', count: 2500, fill: '#3b82f6' },
  { stage: 'Contacted', count: 1200, fill: '#8b5cf6' },
  { stage: 'Qualified', count: 600, fill: '#f59e0b' },
  { stage: 'Proposal', count: 300, fill: '#6366f1' },
  { stage: 'Negotiation', count: 120, fill: '#10b981' },
  { stage: 'Closed Won', count: 52, fill: '#22c55e' },
]

const teamPerformance = [
  { name: 'Alice', deals: 15, revenue: 125000, quota: 100000 },
  { name: 'Bob', deals: 12, revenue: 98000, quota: 100000 },
  { name: 'Charlie', deals: 18, revenue: 156000, quota: 120000 },
  { name: 'Diana', deals: 14, revenue: 112000, quota: 100000 },
  { name: 'Eve', deals: 10, revenue: 85000, quota: 100000 },
]

const topCampaigns = [
  { name: 'Enterprise Outreach', revenue: 245000, deals: 18, roi: 340 },
  { name: 'SaaS Decision Makers', revenue: 189000, deals: 14, roi: 280 },
  { name: 'Tech Innovators', revenue: 156000, deals: 12, roi: 220 },
  { name: 'Mid-Market Focus', revenue: 98000, deals: 8, roi: 180 },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Track your revenue performance and team metrics
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="ytd">Year to date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(892000)}</div>
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              +15.3% vs last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Closed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(52)}</div>
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              +8.2% vs last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(29)}</div>
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              +2.1% vs last period
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(17154)}</div>
            <div className="flex items-center text-xs text-red-500">
              <TrendingDown className="mr-1 h-3 w-3" />
              -3.2% vs last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Channel Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Channel</CardTitle>
            <CardDescription>Distribution across outreach channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {channelData.map((channel) => (
                  <div key={channel.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: channel.color }}
                      />
                      <span className="text-sm">{channel.name}</span>
                    </div>
                    <span className="text-sm font-medium">{channel.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Funnel</CardTitle>
          <CardDescription>Conversion through each stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelData.map((stage, index) => {
              const widthPercent = (stage.count / funnelData[0].count) * 100
              return (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{stage.stage}</span>
                    <span className="text-muted-foreground">
                      {formatNumber(stage.count)} leads
                    </span>
                  </div>
                  <div className="h-8 w-full rounded-lg bg-muted">
                    <div
                      className="h-full rounded-lg transition-all flex items-center justify-end pr-3"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: stage.fill,
                      }}
                    >
                      <span className="text-xs font-medium text-white">
                        {widthPercent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Individual contribution to revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {teamPerformance.map((rep) => {
              const quotaPercent = (rep.revenue / rep.quota) * 100
              return (
                <div key={rep.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{rep.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium">{rep.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {rep.deals} deals
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(rep.revenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        Quota: {formatCurrency(rep.quota)}
                      </p>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        quotaPercent >= 100 ? 'bg-green-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-right text-muted-foreground">
                    {quotaPercent.toFixed(0)}% of quota
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Campaigns</CardTitle>
          <CardDescription>Campaigns generating the most revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCampaigns.map((campaign, index) => (
              <div
                key={campaign.name}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-medium">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.deals} deals
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(campaign.revenue)}</p>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                  </div>
                  <Badge
                    variant={campaign.roi >= 300 ? 'success' : 'secondary'}
                  >
                    {campaign.roi}% ROI
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
