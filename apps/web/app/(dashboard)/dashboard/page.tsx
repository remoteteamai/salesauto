'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { KpiCard } from '@/components/dashboard/kpi-card'
import {
  Bell,
  AlertTriangle,
  Users,
  Mail,
  TrendingUp,
  ArrowUpRight,
  Building2,
  User,
  ExternalLink,
  Eye,
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

// Types
interface Alert {
  id: string
  name: string
  type: string
  companyName: string
  personName?: string
  intentScore: number
  timestamp: Date
  isRead: boolean
}

// Mock data for KPI cards
const kpiData = {
  totalAlerts: 1284,
  unreadAlerts: 42,
  prospects: 2847,
  sequences: 15,
}

// Mock recent alerts data
const recentAlerts: Alert[] = [
  {
    id: '1',
    name: 'Bombora Surge Alert',
    type: 'surge',
    companyName: 'TechCorp Inc.',
    personName: 'Sarah Chen',
    intentScore: 87,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isRead: false,
  },
  {
    id: '2',
    name: 'Competitor Pricing Page',
    type: 'intent',
    companyName: 'ScaleUp Solutions',
    personName: 'Michael Torres',
    intentScore: 72,
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    isRead: false,
  },
  {
    id: '3',
    name: 'Direct Website Visit',
    type: 'web',
    companyName: 'InnovateCo',
    personName: 'Emily Rodriguez',
    intentScore: 65,
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    isRead: true,
  },
  {
    id: '4',
    name: 'Job Change Alert',
    type: 'job',
    companyName: 'Enterprise Dynamics',
    personName: 'James Wilson',
    intentScore: 58,
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    isRead: true,
  },
]

const alertTypeColors: Record<string, string> = {
  surge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  intent: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  web: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  job: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
}

const getIntentColor = (score: number): string => {
  if (score >= 80) return 'text-red-500 bg-red-50 dark:bg-red-950 dark:text-red-400'
  if (score >= 60) return 'text-orange-500 bg-orange-50 dark:bg-orange-950 dark:text-orange-400'
  if (score >= 40) return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400'
  return 'text-slate-500 bg-slate-50 dark:bg-slate-900 dark:text-slate-400'
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor your intent signals and outreach performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Alerts"
          value={kpiData.totalAlerts}
          change={12.5}
          format="number"
          icon={Bell}
          iconColor="text-indigo-500"
        />
        <KpiCard
          title="Unread Alerts"
          value={kpiData.unreadAlerts}
          change={-8.2}
          format="number"
          icon={AlertTriangle}
          iconColor="text-amber-500"
        />
        <KpiCard
          title="Prospects"
          value={kpiData.prospects}
          change={15.3}
          format="number"
          icon={Users}
          iconColor="text-emerald-500"
        />
        <KpiCard
          title="Sequences"
          value={kpiData.sequences}
          change={0}
          format="number"
          icon={Mail}
          iconColor="text-blue-500"
        />
      </div>

      {/* Recent Alerts Section */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-500" />
                Recent Alerts
              </CardTitle>
              <CardDescription>
                Latest intent signals from your prospects
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/alerts">
                View All
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Unread indicator */}
                  <div className="flex-shrink-0">
                    {!alert.isRead && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                  </div>

                  {/* Alert icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {alert.type === 'surge' && (
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                      )}
                      {alert.type === 'intent' && (
                        <AlertTriangle className="h-5 w-5 text-blue-500" />
                      )}
                      {alert.type === 'web' && (
                        <User className="h-5 w-5 text-green-500" />
                      )}
                      {alert.type === 'job' && (
                        <Building2 className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                  </div>

                  {/* Alert info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900 dark:text-white truncate">
                        {alert.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${alertTypeColors[alert.type]}`}
                      >
                        {alert.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      {alert.personName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {alert.personName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {alert.companyName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Intent Score and Timestamp */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${getIntentColor(
                        alert.intentScore
                      )}`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      {alert.intentScore}%
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Intent Score
                    </p>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Top Intent Signals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Top Intent Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { company: 'TechCorp Inc.', score: 92, trend: '+12%' },
                { company: 'ScaleUp Solutions', score: 88, trend: '+8%' },
                { company: 'InnovateCo', score: 85, trend: '+5%' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{item.company}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">{item.score}%</span>
                    <Badge variant="success" className="text-xs">
                      {item.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Sequences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-500" />
              Active Sequences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Enterprise Outreach', active: 45, steps: 5 },
                { name: 'SaaS Decision Makers', active: 32, steps: 7 },
                { name: 'Tech Innovators', active: 28, steps: 4 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">{item.active} active</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.steps} steps
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/alerts">
                  <Bell className="mr-2 h-4 w-4" />
                  View All Alerts
                  <ArrowUpRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/prospects">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Prospects
                  <ArrowUpRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/sequences">
                  <Mail className="mr-2 h-4 w-4" />
                  Edit Sequences
                  <ArrowUpRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
