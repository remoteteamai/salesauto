'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import {
  Search,
  Filter,
  Plus,
  Grid3X3,
  List,
  TrendingUp,
  Users,
  Building2,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  Eye,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
interface Prospect {
  id: string
  name: string
  email: string
  company: string
  companyLogo?: string
  title: string
  intentScore: number
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  lastActivity: Date
  emailsSent: number
  openRate: number
}

// Mock prospects data with intent scores
const mockProspects: Prospect[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@techcorp.com',
    company: 'TechCorp',
    title: 'VP of Engineering',
    intentScore: 87,
    status: 'qualified',
    lastActivity: new Date(Date.now() - 1000 * 60 * 30),
    emailsSent: 12,
    openRate: 58,
  },
  {
    id: '2',
    name: 'Michael Torres',
    email: 'm.torres@scaleup.io',
    company: 'ScaleUp Solutions',
    title: 'CTO',
    intentScore: 92,
    status: 'proposal',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60),
    emailsSent: 18,
    openRate: 72,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@innovate.co',
    company: 'InnovateCo',
    title: 'Head of Product',
    intentScore: 78,
    status: 'negotiation',
    lastActivity: new Date(Date.now() - 1000 * 60 * 90),
    emailsSent: 24,
    openRate: 65,
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'jwilson@enterprise.com',
    company: 'Enterprise Dynamics',
    title: 'CEO',
    intentScore: 85,
    status: 'qualified',
    lastActivity: new Date(Date.now() - 1000 * 60 * 120),
    emailsSent: 8,
    openRate: 88,
  },
  {
    id: '5',
    name: 'Lisa Park',
    email: 'lisa.park@growthinc.com',
    company: 'Growth Inc',
    title: 'Director of Sales',
    intentScore: 72,
    status: 'contacted',
    lastActivity: new Date(Date.now() - 1000 * 60 * 180),
    emailsSent: 6,
    openRate: 50,
  },
  {
    id: '6',
    name: 'David Kim',
    email: 'dkim@startup.io',
    company: 'StartupIO',
    title: 'Founder',
    intentScore: 68,
    status: 'new',
    lastActivity: new Date(Date.now() - 1000 * 60 * 240),
    emailsSent: 2,
    openRate: 100,
  },
  {
    id: '7',
    name: 'Amanda Foster',
    email: 'afoster@bigcorp.com',
    company: 'BigCorp Global',
    title: 'VP Operations',
    intentScore: 91,
    status: 'won',
    lastActivity: new Date(Date.now() - 1000 * 60 * 300),
    emailsSent: 30,
    openRate: 73,
  },
  {
    id: '8',
    name: 'Robert Martinez',
    email: 'rmartinez@globaltech.com',
    company: 'GlobalTech',
    title: 'Senior Developer',
    intentScore: 55,
    status: 'contacted',
    lastActivity: new Date(Date.now() - 1000 * 60 * 360),
    emailsSent: 4,
    openRate: 75,
  },
]

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  new: 'default',
  contacted: 'secondary',
  qualified: 'success',
  proposal: 'warning',
  negotiation: 'default',
  won: 'success',
  lost: 'destructive',
}

const getIntentColor = (score: number): string => {
  if (score >= 80) return 'text-red-500 bg-red-50 dark:bg-red-950 dark:text-red-400'
  if (score >= 60) return 'text-orange-500 bg-orange-50 dark:bg-orange-950 dark:text-orange-400'
  if (score >= 40) return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400'
  return 'text-slate-500 bg-slate-50 dark:bg-slate-900 dark:text-slate-400'
}

export default function ProspectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredProspects = mockProspects.filter((prospect) => {
    const matchesSearch =
      prospect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.company.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || prospect.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-500" />
            Prospects
          </h2>
          <p className="text-muted-foreground">
            {filteredProspects.length} prospects in your pipeline
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Prospect
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Prospect</DialogTitle>
              <DialogDescription>
                Add a new prospect to your pipeline
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="John Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@company.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="Acme Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="VP of Sales" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Add Prospect</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters & View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, company or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prospects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProspects.map((prospect) => (
            <Card
              key={prospect.id}
              className="hover:shadow-md transition-all cursor-pointer group"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  {/* Company Logo Placeholder */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 flex items-center justify-center">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {prospect.company.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{prospect.company}</CardTitle>
                      <CardDescription className="text-xs">{prospect.title}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Person Info */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {prospect.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{prospect.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{prospect.email}</p>
                  </div>
                </div>

                {/* Intent Score */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Intent Score</span>
                  <div
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                      getIntentColor(prospect.intentScore)
                    )}
                  >
                    <TrendingUp className="h-3 w-3" />
                    {prospect.intentScore}%
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
                    <p className="text-muted-foreground">Emails</p>
                    <p className="font-semibold">{prospect.emailsSent}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
                    <p className="text-muted-foreground">Open Rate</p>
                    <p className="font-semibold">{prospect.openRate}%</p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Badge variant={statusColors[prospect.status]} className="text-xs">
                    {prospect.status}
                  </Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Mail className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProspects.map((prospect) => (
                <div
                  key={prospect.id}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
                >
                  {/* Company Logo */}
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {prospect.company.charAt(0)}
                    </span>
                  </div>

                  {/* Company & Person */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{prospect.company}</span>
                      <Badge variant={statusColors[prospect.status]} className="text-xs">
                        {prospect.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {prospect.name} • {prospect.title}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="hidden lg:block w-48">
                    <p className="text-sm truncate">{prospect.email}</p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Emails</p>
                      <p className="font-semibold">{prospect.emailsSent}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Open Rate</p>
                      <p className="font-semibold">{prospect.openRate}%</p>
                    </div>
                  </div>

                  {/* Intent Score */}
                  <div className="text-right">
                    <div
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold',
                        getIntentColor(prospect.intentScore)
                      )}
                    >
                      <TrendingUp className="h-3 w-3" />
                      {prospect.intentScore}%
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
