'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Mail,
  Linkedin,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Edit,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
} from 'lucide-react'

// Types
interface Sequence {
  id: string
  name: string
  type: 'email' | 'linkedin' | 'multi'
  status: 'active' | 'paused' | 'draft'
  steps: number
  activeContacts: number
  totalContacts: number
  openRate: number
  responseRate: number
  createdAt: Date
}

const mockSequences: Sequence[] = [
  {
    id: '1',
    name: 'Enterprise Decision Makers',
    type: 'email',
    status: 'active',
    steps: 5,
    activeContacts: 245,
    totalContacts: 500,
    openRate: 42.5,
    responseRate: 12.3,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'SaaS Outreach Sequence',
    type: 'email',
    status: 'active',
    steps: 7,
    activeContacts: 189,
    totalContacts: 350,
    openRate: 38.2,
    responseRate: 9.7,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: 'LinkedIn Connection Sequence',
    type: 'linkedin',
    status: 'active',
    steps: 4,
    activeContacts: 156,
    totalContacts: 280,
    openRate: 65.8,
    responseRate: 15.4,
    createdAt: new Date('2024-01-05'),
  },
  {
    id: '4',
    name: 'Tech Innovators 2024',
    type: 'multi',
    status: 'paused',
    steps: 8,
    activeContacts: 92,
    totalContacts: 200,
    openRate: 45.1,
    responseRate: 11.2,
    createdAt: new Date('2023-12-20'),
  },
  {
    id: '5',
    name: 'Mid-Market Expansion',
    type: 'email',
    status: 'draft',
    steps: 6,
    activeContacts: 0,
    totalContacts: 0,
    openRate: 0,
    responseRate: 0,
    createdAt: new Date('2024-01-18'),
  },
  {
    id: '6',
    name: 'Follow-up Sequence',
    type: 'email',
    status: 'active',
    steps: 3,
    activeContacts: 78,
    totalContacts: 150,
    openRate: 51.2,
    responseRate: 18.5,
    createdAt: new Date('2024-01-08'),
  },
]

const statusColors: Record<string, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  paused: 'warning',
  draft: 'secondary',
}

const typeIcons: Record<string, typeof Mail> = {
  email: Mail,
  linkedin: Linkedin,
  multi: BarChart3,
}

export default function SequencesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredSequences = mockSequences.filter((sequence) => {
    const matchesSearch = sequence.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sequence.status === statusFilter
    const matchesType = typeFilter === 'all' || sequence.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const activeSequences = mockSequences.filter((s) => s.status === 'active')
  const totalActiveContacts = activeSequences.reduce((acc, s) => acc + s.activeContacts, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-6 w-6 text-indigo-500" />
            Sequences
          </h2>
          <p className="text-muted-foreground">
            Create and manage your outreach sequences
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Sequence
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Sequence</DialogTitle>
              <DialogDescription>
                Set up a new outreach sequence to engage prospects
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Sequence Name</Label>
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
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </div>
                      </SelectItem>
                      <SelectItem value="multi">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Multi-Channel
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="steps">Number of Steps</Label>
                  <Input id="steps" type="number" placeholder="5" min="1" max="20" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Create Sequence</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sequences</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSequences.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockSequences.filter((s) => s.status === 'draft').length} drafts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sequences</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSequences.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockSequences.filter((s) => s.status === 'paused').length} paused
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveContacts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all sequences
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.8%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sequences..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="multi">Multi-Channel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sequences Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSequences.map((sequence) => {
          const TypeIcon = typeIcons[sequence.type] || Mail
          return (
            <Card
              key={sequence.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        sequence.type === 'email'
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : sequence.type === 'linkedin'
                          ? 'bg-sky-100 dark:bg-sky-900'
                          : 'bg-purple-100 dark:bg-purple-900'
                      }`}
                    >
                      <TypeIcon
                        className={`h-5 w-5 ${
                          sequence.type === 'email'
                            ? 'text-blue-500'
                            : sequence.type === 'linkedin'
                            ? 'text-sky-500'
                            : 'text-purple-500'
                        }`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">{sequence.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {sequence.type === 'email' && 'Email'}
                        {sequence.type === 'linkedin' && 'LinkedIn'}
                        {sequence.type === 'multi' && 'Multi-Channel'}
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        {sequence.steps} steps
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={statusColors[sequence.status]}>
                    {sequence.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                {sequence.totalContacts > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {sequence.activeContacts} / {sequence.totalContacts}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{
                          width: `${(sequence.activeContacts / sequence.totalContacts) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      Open Rate
                    </div>
                    <p className="text-lg font-semibold">
                      {sequence.openRate > 0 ? `${sequence.openRate}%` : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      Response
                    </div>
                    <p className="text-lg font-semibold">
                      {sequence.responseRate > 0 ? `${sequence.responseRate}%` : '-'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {sequence.status === 'draft' ? (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1">
                      <Clock className="mr-1.5 h-3.5 w-3.5" />
                      {sequence.status === 'paused' ? 'Resume' : 'Pause'}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
