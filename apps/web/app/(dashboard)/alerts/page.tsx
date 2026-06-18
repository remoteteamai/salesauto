'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Bell,
  Download,
  Filter,
  TrendingUp,
  Building2,
  User,
  Eye,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

// Types
interface Alert {
  id: string
  name: string
  type: string
  companyName: string
  personName?: string
  personTitle?: string
  intentScore: number
  timestamp: Date
  isRead: boolean
  source?: string
}

// Mock alerts data
const alertsData: Alert[] = [
  {
    id: '1',
    name: 'High Intent Tech Leads',
    type: 'surge',
    companyName: 'TechCorp Inc.',
    personName: 'Sarah Chen',
    personTitle: 'VP of Engineering',
    intentScore: 87,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isRead: false,
    source: 'Bombora',
  },
  {
    id: '2',
    name: 'Bombora Surge Alert',
    type: 'surge',
    companyName: 'ScaleUp Solutions',
    personName: 'Michael Torres',
    personTitle: 'CTO',
    intentScore: 92,
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    isRead: false,
    source: 'Bombora',
  },
  {
    id: '3',
    name: 'Competitor Pricing Page',
    type: 'intent',
    companyName: 'InnovateCo',
    personName: 'Emily Rodriguez',
    personTitle: 'Head of Product',
    intentScore: 72,
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    isRead: true,
    source: 'Website',
  },
  {
    id: '4',
    name: 'Direct Website Visit',
    type: 'web',
    companyName: 'Enterprise Dynamics',
    personName: 'James Wilson',
    personTitle: 'CEO',
    intentScore: 65,
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    isRead: true,
    source: 'Direct',
  },
  {
    id: '5',
    name: 'Job Change Alert',
    type: 'job',
    companyName: 'Growth Ventures',
    personName: 'Amanda Foster',
    personTitle: 'Director of Sales',
    intentScore: 58,
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    isRead: true,
    source: 'LinkedIn',
  },
  {
    id: '6',
    name: 'Product Documentation View',
    type: 'intent',
    companyName: 'GlobalTech',
    personName: 'Robert Martinez',
    personTitle: 'Senior Developer',
    intentScore: 45,
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    isRead: true,
    source: 'Website',
  },
  {
    id: '7',
    name: 'Demo Request',
    type: 'surge',
    companyName: 'StartupIO',
    personName: 'Lisa Park',
    personTitle: 'Founder',
    intentScore: 95,
    timestamp: new Date(Date.now() - 1000 * 60 * 360),
    isRead: false,
    source: 'Website',
  },
  {
    id: '8',
    name: 'Pricing Page Visit',
    type: 'intent',
    companyName: 'CloudScale',
    personName: 'David Kim',
    personTitle: 'VP of Operations',
    intentScore: 78,
    timestamp: new Date(Date.now() - 1000 * 60 * 420),
    isRead: false,
    source: 'Website',
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

export default function AlertsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [alertNameFilter, setAlertNameFilter] = useState<string>('all')
  const [scoreFilter, setScoreFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set())
  const itemsPerPage = 4

  // Calculate stats
  const totalAlerts = alertsData.length
  const unreadAlerts = alertsData.filter((a) => !a.isRead).length

  // Filter alerts
  const filteredAlerts = alertsData.filter((alert) => {
    const matchesSearch =
      alert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.personName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesAlertName = alertNameFilter === 'all' || alert.name === alertNameFilter
    const matchesScore =
      scoreFilter === 'all' ||
      (scoreFilter === 'high' && alert.intentScore >= 80) ||
      (scoreFilter === 'medium' && alert.intentScore >= 60 && alert.intentScore < 80) ||
      (scoreFilter === 'low' && alert.intentScore < 60)

    let matchesDate = true
    if (dateFilter === 'today') {
      matchesDate = format(alert.timestamp, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    } else if (dateFilter === 'week') {
      matchesDate = alert.timestamp >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    } else if (dateFilter === 'month') {
      matchesDate = alert.timestamp >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    return matchesSearch && matchesAlertName && matchesScore && matchesDate
  })

  // Pagination
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage)
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Get unique alert names for filter
  const uniqueAlertNames = [...new Set(alertsData.map((a) => a.name))]

  const handleSelectAll = () => {
    if (selectedAlerts.size === paginatedAlerts.length) {
      setSelectedAlerts(new Set())
    } else {
      setSelectedAlerts(new Set(paginatedAlerts.map((a) => a.id)))
    }
  }

  const handleSelectAlert = (id: string) => {
    const newSelected = new Set(selectedAlerts)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedAlerts(newSelected)
  }

  const handleExportCSV = () => {
    const headers = ['Alert Name', 'Company', 'Person', 'Intent Score', 'Timestamp']
    const rows = filteredAlerts.map((alert) => [
      alert.name,
      alert.companyName,
      alert.personName || '',
      alert.intentScore.toString(),
      format(alert.timestamp, 'yyyy-MM-dd HH:mm'),
    ])
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'alerts-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-indigo-500" />
            Alerts History
          </h2>
          <p className="text-muted-foreground">
            Monitor and manage all your intent signal alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Total: <span className="font-semibold text-slate-900 dark:text-white">{totalAlerts}</span>
            </span>
            <span className="text-muted-foreground">
              Unread: <span className="font-semibold text-amber-500">{unreadAlerts}</span>
            </span>
          </div>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search alerts, companies or prospects..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-3">
              <Select value={alertNameFilter} onValueChange={setAlertNameFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Alert Name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alert Names</SelectItem>
                  {uniqueAlertNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">High (80%+)</SelectItem>
                  <SelectItem value="medium">Medium (60-79%)</SelectItem>
                  <SelectItem value="low">Low (&lt;60%)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected count */}
          {selectedAlerts.size > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedAlerts.size} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAlerts(new Set())}
              >
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableHead className="w-[40px]">
                  <input
                    type="checkbox"
                    checked={selectedAlerts.size === paginatedAlerts.length && paginatedAlerts.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-500 focus:ring-indigo-500"
                  />
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Alert Details</TableHead>
                <TableHead>Prospect / Company</TableHead>
                <TableHead className="w-[120px]">Intent Score</TableHead>
                <TableHead className="w-[150px]">Timestamp</TableHead>
                <TableHead className="w-[180px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAlerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  className={`group ${!alert.isRead ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedAlerts.has(alert.id)}
                      onChange={() => handleSelectAlert(alert.id)}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-500 focus:ring-indigo-500"
                    />
                  </TableCell>
                  <TableCell>
                    {!alert.isRead && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{alert.name}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${alertTypeColors[alert.type]}`}
                        >
                          {alert.type}
                        </Badge>
                      </div>
                      {alert.source && (
                        <span className="text-xs text-muted-foreground">
                          Source: {alert.source}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {alert.personName && (
                        <span className="flex items-center gap-1.5 text-sm">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium">{alert.personName}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        {alert.companyName}
                      </span>
                      {alert.personTitle && (
                        <span className="text-xs text-slate-400 ml-5">
                          {alert.personTitle}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${getIntentColor(
                        alert.intentScore
                      )}`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      {alert.intentScore}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(alert.timestamp, 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredAlerts.length)} of{' '}
            {filteredAlerts.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
