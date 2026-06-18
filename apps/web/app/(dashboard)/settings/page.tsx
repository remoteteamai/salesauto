'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useTheme } from 'next-themes'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  Bell,
  Shield,
  Key,
  Globe,
  Smartphone,
  Mail,
  Copy,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  Trash2,
  Plus,
  AlertTriangle,
} from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: Date
  lastUsed: Date | null
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production Key',
      key: 'sk_live_melioro_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'sk_test_melioro_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4',
      createdAt: new Date('2024-01-10'),
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ])

  const handleSave = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully.',
      })
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied to clipboard',
      description: 'API key has been copied to your clipboard.',
    })
  }

  const generateNewKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: `sk_live_melioro_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date(),
      lastUsed: null,
    }
    setApiKeys([...apiKeys, newKey])
    toast({
      title: 'API key generated',
      description: 'Your new API key has been created.',
    })
  }

  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id))
    toast({
      title: 'API key deleted',
      description: 'The API key has been removed.',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-500" />
          Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your account settings, API keys, and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Globe className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-500" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">AR</span>
                </div>
                <div>
                  <Button variant="outline">Change Avatar</Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Alex" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Rivera" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="alex.rivera@melioro.ai" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" defaultValue="Melioro AI" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue="Enterprise Account Executive" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="america_new_york">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america_new_york">America/New_York (EST)</SelectItem>
                    <SelectItem value="america_los_angeles">America/Los_Angeles (PST)</SelectItem>
                    <SelectItem value="europe_london">Europe/London (GMT)</SelectItem>
                    <SelectItem value="asia_tokyo">Asia/Tokyo (JST)</SelectItem>
                    <SelectItem value="australia_sydney">Australia/Sydney (AEST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-indigo-500" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Choose what updates you want to receive via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New High-Intent Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when prospects reach high intent scores (80%+)
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Lead Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new leads are added to your pipeline
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Meeting Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders before scheduled meetings
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Campaign Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily summary of campaign performance
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly analytics and performance reports
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Product Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    News about new features and improvements
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-500" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Configure push notification preferences for your devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable browser push notifications
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mobile App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications on your mobile device
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Slack Integration</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to your Slack workspace
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="apikeys" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-indigo-500" />
                    API Keys
                  </CardTitle>
                  <CardDescription>
                    Manage your API keys for programmatic access
                  </CardDescription>
                </div>
                <Button onClick={generateNewKey}>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Keep your API keys secure
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Never share your API keys in public repositories or client-side code.
                      If compromised, immediately regenerate the key.
                    </p>
                  </div>
                </div>
              </div>

              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{apiKey.name}</p>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono text-xs">
                        {showApiKey === apiKey.id ? apiKey.key : '•'.repeat(40)}
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                      {apiKey.lastUsed && ` • Last used: ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                    >
                      {showApiKey === apiKey.id ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => deleteApiKey(apiKey.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Separator />

              <div>
                <h4 className="font-medium mb-2">API Documentation</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Learn how to integrate with the Melioro AI API
                </p>
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View API Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-500" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-indigo-500" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label>2FA Status</Label>
                    <Badge variant="secondary">Disabled</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Protect your account with two-factor authentication
                  </p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium">MacBook Pro - Chrome</p>
                    <p className="text-sm text-muted-foreground">
                      San Francisco, CA • Current session
                    </p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium">iPhone 15</p>
                    <p className="text-sm text-muted-foreground">
                      San Francisco, CA • 2 hours ago
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Revoke</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium">Windows PC - Firefox</p>
                    <p className="text-sm text-muted-foreground">
                      New York, NY • Yesterday
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Revoke</Button>
              </div>
              <Button variant="destructive" className="mt-4">
                Sign Out All Other Sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-500" />
                Connected Apps
              </CardTitle>
              <CardDescription>
                Manage your third-party integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#0A66C2] flex items-center justify-center text-white font-bold">
                    in
                  </div>
                  <div>
                    <p className="font-medium">LinkedIn</p>
                    <p className="text-sm text-muted-foreground">
                      Connected • Syncing campaigns
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Disconnect</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#00A1E0] flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <p className="font-medium">Salesforce</p>
                    <p className="text-sm text-muted-foreground">
                      Connected • CRM sync active
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Disconnect</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white font-bold">
                    G
                  </div>
                  <div>
                    <p className="font-medium">Google Calendar</p>
                    <p className="text-sm text-muted-foreground">
                      Connected • Meeting sync active
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Disconnect</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <p className="font-medium">Slack</p>
                    <p className="text-sm text-muted-foreground">
                      Not connected
                    </p>
                  </div>
                </div>
                <Button size="sm">Connect</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold">
                    H
                  </div>
                  <div>
                    <p className="font-medium">HubSpot</p>
                    <p className="text-sm text-muted-foreground">
                      Not connected
                    </p>
                  </div>
                </div>
                <Button size="sm">Connect</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
