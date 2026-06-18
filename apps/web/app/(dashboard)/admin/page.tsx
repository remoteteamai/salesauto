'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Users,
  CreditCard,
  Activity,
  Settings,
  Shield,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  RefreshCw,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

// Mock users data
const mockUsers = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@melioro.ai',
    role: 'admin',
    status: 'active',
    plan: 'enterprise',
    joinedAt: '2023-06-15',
  },
  {
    id: '2',
    name: 'Bob Williams',
    email: 'bob@melioro.ai',
    role: 'manager',
    status: 'active',
    plan: 'professional',
    joinedAt: '2023-08-22',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@client.com',
    role: 'sales_rep',
    status: 'active',
    plan: 'professional',
    joinedAt: '2023-09-10',
  },
  {
    id: '4',
    name: 'Diana Smith',
    email: 'diana@client.com',
    role: 'sales_rep',
    status: 'active',
    plan: 'starter',
    joinedAt: '2023-10-05',
  },
  {
    id: '5',
    name: 'Edward Davis',
    email: 'edward@former-client.com',
    role: 'sales_rep',
    status: 'inactive',
    plan: 'starter',
    joinedAt: '2023-07-20',
  },
]

// Mock subscription data
const mockSubscriptions = [
  { id: '1', customer: 'TechCorp', plan: 'enterprise', amount: 2499, status: 'active', nextBilling: '2024-02-15' },
  { id: '2', customer: 'ScaleUp Inc', plan: 'professional', amount: 999, status: 'active', nextBilling: '2024-02-20' },
  { id: '3', customer: 'InnovateCo', plan: 'professional', amount: 999, status: 'past_due', nextBilling: '2024-01-10' },
  { id: '4', customer: 'Enterprise Co', plan: 'enterprise', amount: 2499, status: 'active', nextBilling: '2024-02-25' },
  { id: '5', customer: 'Growth Inc', plan: 'starter', amount: 499, status: 'canceled', nextBilling: '-' },
]

// Mock audit log data
const mockAuditLogs = [
  { id: '1', action: 'User Created', user: 'Alice Johnson', target: 'charlie@client.com', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '2', action: 'Plan Changed', user: 'System', target: 'ScaleUp Inc - upgraded to Enterprise', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '3', action: 'Payment Failed', user: 'System', target: 'InnovateCo', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: '4', action: 'Admin Access', user: 'Bob Williams', target: 'User management', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
  { id: '5', action: 'API Key Generated', user: 'Alice Johnson', target: 'TechCorp API Key', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
]

const roleColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  admin: 'destructive',
  manager: 'default',
  sales_rep: 'secondary',
}

const planColors: Record<string, 'default' | 'secondary' | 'outline'> = {
  enterprise: 'default',
  professional: 'secondary',
  starter: 'outline',
}

const statusColors: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  active: 'success',
  inactive: 'secondary',
  past_due: 'warning',
  canceled: 'destructive',
}

export default function AdminPage() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Portal</h2>
          <p className="text-muted-foreground">
            Manage users, subscriptions, and system settings
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(12995)}</div>
            <p className="text-xs text-green-500 flex items-center">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12.5% vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSubscriptions.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockSubscriptions.filter(s => s.status === 'past_due').length} past due
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">Healthy</span>
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Activity className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </div>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account and assign permissions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Smith" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@company.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="sales_rep">Sales Rep</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Plan</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="starter">Starter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsAddUserOpen(false)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search users..." className="pl-9" />
                </div>
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleColors[user.role]}>{user.role.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[user.status]}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={planColors[user.plan]}>{user.plan}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(user.joinedAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>
                Monitor and manage customer subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.customer}</TableCell>
                      <TableCell>
                        <Badge variant={planColors[sub.plan]}>{sub.plan}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(sub.amount)}/mo</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[sub.status]}>
                          {sub.status === 'active' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {sub.status === 'past_due' && <AlertTriangle className="mr-1 h-3 w-3" />}
                          {sub.status === 'canceled' && <XCircle className="mr-1 h-3 w-3" />}
                          {sub.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{sub.nextBilling !== '-' ? format(new Date(sub.nextBilling), 'MMM d, yyyy') : '-'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Track important system events and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAuditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className="mt-1">
                      {log.action.includes('Failed') ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground">{log.target}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>By: {log.user}</span>
                        <span>•</span>
                        <span>{format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure global system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" defaultValue="Melioro AI" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" type="email" defaultValue="support@melioro.ai" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultPlan">Default Plan for New Users</Label>
                <Select defaultValue="starter">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure system email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input id="senderName" defaultValue="Melioro AI" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderEmail">Sender Email</Label>
                <Input id="senderEmail" type="email" defaultValue="noreply@melioro.ai" />
              </div>
              <Button>Save Email Settings</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions. Proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50">
                <div>
                  <p className="font-medium">Reset All Demo Data</p>
                  <p className="text-sm text-muted-foreground">
                    Clear all demo data and reset to initial state
                  </p>
                </div>
                <Button variant="destructive">Reset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
