'use client'

import { useState, useRef } from 'react'
import { 
  Zap, Bell, Users, Mail, Settings, ChevronLeft, Menu, X, 
  Upload, Download, FileText, Info, CheckCircle, RefreshCw, Circle,
  Phone, ShieldCheck, Building2, Link2, User2, Globe,
  Plus, MoreHorizontal, History
} from 'lucide-react'

// Mock data providers
const providers = [
  { id: 'clearbit', name: 'Clearbit', initials: 'CB', color: 'bg-blue-100 text-blue-600', description: 'Firmographics & Tech', enabled: true },
  { id: 'lusha', name: 'Lusha', initials: 'L', color: 'bg-indigo-100 text-indigo-600', description: 'Mobile Numbers', enabled: true },
  { id: 'hunter', name: 'Hunter.io', initials: 'H', color: 'bg-orange-100 text-orange-600', description: 'Email Verification', enabled: true },
  { id: 'zoominfo', name: 'ZoomInfo', initials: 'Z', color: 'bg-slate-100 text-slate-600', description: 'B2B Intel', enabled: false },
]

// Mock enrichment data
const enrichmentData = [
  { id: '1', name: 'Sarah Chen', initials: 'SC', title: 'VP Marketing', company: 'Vercel', status: 'success', stage: 'Lusha', phone: true, mobile: true, directDial: true },
  { id: '2', name: 'Marcus Johnson', initials: 'MJ', title: 'CTO', company: 'Ramp', status: 'matching', stage: 'Clearbit', phone: false, mobile: false },
  { id: '3', name: 'Ananya Kapoor', initials: 'AK', title: 'Director of Sales', company: 'Gong', status: 'success', stage: 'Hunter', phone: true, verified: true },
]

// Mock activity history
const activityHistory = [
  { id: '1', name: 'Salesforce Lead Sync', type: 'Sync', status: 'completed', leads: 42, time: 'Today, 10:45 AM', icon: 'sync' },
  { id: '2', name: 'Bulk Upload #4092', type: 'Upload', status: 'progress', leads: 850, time: 'Today, 09:12 AM', icon: 'upload' },
  { id: '3', name: 'Export: Sales_Qualified_Leads.csv', type: 'Download', status: 'completed', leads: 124, time: 'Yesterday, 4:30 PM', icon: 'download' },
  { id: '4', name: 'HubSpot Contact Sync', type: 'Sync', status: 'failed', leads: 0, time: 'Oct 24, 11:15 AM', icon: 'error' },
]

export default function EnrichmentPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(82)
  const [showToast, setShowToast] = useState(true)
  const [salesforceConnected, setSalesforceConnected] = useState(true)
  const [hubspotConnected, setHubspotConnected] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Handle file drop
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const toggleProvider = (id: string) => {
    // Toggle provider enabled state
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-green-900/20">
            <CheckCircle className="h-5 w-5 font-bold" />
            <p className="font-bold text-sm tracking-tight">Leads successfully synced to Salesforce</p>
            <button 
              className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
              onClick={() => setShowToast(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 lg:px-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-indigo-500">
            <Zap className="h-8 w-8 font-bold" />
            <h2 className="text-slate-900 dark:text-white text-xl font-extrabold leading-tight tracking-tight">Melioro AI</h2>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-slate-600 dark:text-slate-300 text-sm font-semibold hover:text-indigo-500 transition-colors" href="/dashboard">Dashboard</a>
            <a className="text-indigo-500 text-sm font-semibold border-b-2 border-indigo-500 pb-1" href="/enrichment">Enrichment</a>
            <a className="text-slate-600 dark:text-slate-300 text-sm font-semibold hover:text-indigo-500 transition-colors" href="#">Integrations</a>
            <a className="text-slate-600 dark:text-slate-300 text-sm font-semibold hover:text-indigo-500 transition-colors" href="#">API</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700">
            <Bell className="h-5 w-5 text-slate-400 mr-2" />
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm w-48 placeholder:text-slate-400" 
              placeholder="Search data..." 
              type="text"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
          <div className="size-10 rounded-full border-2 border-indigo-500 overflow-hidden">
            <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-bold">
              AR
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Waterfall Config */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 gap-8 overflow-y-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="text-indigo-500 h-5 w-5" />
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Waterfall Config</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-indigo-500 h-5 w-5" />
                  <span className="text-sm font-semibold">Active Engine</span>
                </div>
                <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold">LIVE</span>
              </div>
              
              <div className="flex flex-col gap-2 mt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Active Providers</p>
                {providers.map((provider) => (
                  <div 
                    key={provider.id}
                    onClick={() => toggleProvider(provider.id)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                  >
                    <div className={`size-8 rounded flex items-center justify-center font-bold ${provider.color}`}>
                      {provider.initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold">{provider.name}</p>
                      <p className="text-[10px] text-slate-500">{provider.description}</p>
                    </div>
                    {provider.enabled ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
            <button className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              Add Provider
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
          {/* Page Title & Quick Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Data Enrichment</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Scale your outbound with Melioro AI's waterfall verification engine.</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all">
              <Download className="h-5 w-5" />
              Download Enriched CSV
            </button>
          </div>

          {/* Bulk Upload Area */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Upload Zone */}
              <div className="space-y-6">
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleFileSelect}
                  className={`flex flex-col items-center justify-center border-2 border-dashed border-indigo-500/40 bg-indigo-500/5 rounded-2xl p-10 group cursor-pointer hover:bg-indigo-500/10 transition-colors ${isDragging ? 'bg-indigo-500/20' : ''}`}
                >
                  <Upload className="h-12 w-12 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold">Bulk Upload CSV</h3>
                  <p className="text-sm text-slate-500 text-center mt-2 max-w-xs">
                    Drag and drop your contact list or <span className="text-indigo-500 font-semibold">browse files</span>
                  </p>
                  <div className="mt-6 flex gap-2">
                    <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded uppercase">CSV</span>
                    <span className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded uppercase">XLSX</span>
                  </div>
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".csv,.xlsx"
                  className="hidden"
                  onChange={() => {}}
                />
              </div>

              {/* Required Formats */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Info className="text-indigo-500 h-5 w-5" />
                  Required Input Formats
                </h4>
                <p className="text-sm text-slate-500">Ensure your file includes at least three of the following columns for maximum matching accuracy:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Link2 className="text-indigo-500 h-5 w-5" />
                    <span className="text-xs font-medium">LinkedIn URL</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <User2 className="text-indigo-500 h-5 w-5" />
                    <span className="text-xs font-medium">First & Last Name</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Building2 className="text-indigo-500 h-5 w-5" />
                    <span className="text-xs font-medium">Company Name</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Globe className="text-indigo-500 h-5 w-5" />
                    <span className="text-xs font-medium">Domain</span>
                  </div>
                </div>
                <div className="pt-4 flex items-center gap-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instant Sync</p>
                  <div className="flex gap-2">
                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-1 grayscale opacity-70">
                      <span className="text-xs font-bold text-slate-600">SF</span>
                    </div>
                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-1 grayscale opacity-70">
                      <span className="text-xs font-bold text-orange-600">HS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Enrichment in Progress Table */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <h2 className="text-xl font-bold">Enrichment in Progress</h2>
              </div>
              <div className="text-sm font-semibold text-slate-500">
                Batch #4092 • <span className="text-indigo-500">{uploadProgress}% Complete</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Waterfall Stage</th>
                      <th className="px-6 py-4">Verified Info</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {enrichmentData.map((row) => (
                      <tr key={row.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-500">
                              {row.initials}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{row.name}</p>
                              <p className="text-xs text-slate-500">{row.title} @ {row.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {row.status === 'success' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold">
                              <CheckCircle className="h-3 w-3" /> SUCCESS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                              <RefreshCw className="h-3 w-3 animate-spin" /> MATCHING
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-medium">Found via {row.stage}</p>
                            <div className="w-24 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full ${row.status === 'success' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'} ${row.status === 'success' ? 'w-full' : 'w-3/5'}`}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {row.status === 'success' && (
                              <>
                                <Mail className={row.phone ? 'text-indigo-500' : 'text-slate-300'} />
                                {row.mobile && <Phone className="text-indigo-500" />}
                                {row.directDial && <Phone className="text-indigo-500" />}
                                {row.verified && <ShieldCheck className="text-indigo-500" />}
                              </>
                            )}
                            {row.status === 'matching' && (
                              <>
                                <Mail className="text-slate-300 opacity-30" />
                                <Phone className="text-slate-300 opacity-30" />
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-slate-400 hover:text-indigo-500">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-indigo-500/20">
                <RefreshCw className="text-indigo-500 h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Continuous CRM Sync</p>
                <p className="text-sm text-slate-500">Melioro AI can automatically push verified leads to your CRM.</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={() => setSalesforceConnected(!salesforceConnected)}
                className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl border transition-all shadow-sm ${
                  salesforceConnected 
                    ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle className="h-5 w-5" />
                {salesforceConnected ? 'Synced to Salesforce' : 'Sync to Salesforce'}
              </button>
              <button 
                onClick={() => setHubspotConnected(!hubspotConnected)}
                className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl border transition-all shadow-sm ${
                  hubspotConnected 
                    ? 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold">{hubspotConnected ? '✓' : ''}</span>
                {hubspotConnected ? 'Synced to HubSpot' : 'Sync to HubSpot'}
              </button>
            </div>
          </div>

          {/* Sync & Activity History Section */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <History className="text-indigo-500 h-5 w-5" />
              <h2 className="text-xl font-bold">Sync & Activity History</h2>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Activity Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Leads</th>
                      <th className="px-6 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activityHistory.map((activity) => (
                      <tr key={activity.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {activity.status === 'completed' && activity.icon === 'sync' && (
                              <RefreshCw className="text-green-600 h-5 w-5" />
                            )}
                            {activity.icon === 'upload' && (
                              <Upload className="text-indigo-500 h-5 w-5" />
                            )}
                            {activity.icon === 'download' && (
                              <Download className="text-slate-400 h-5 w-5" />
                            )}
                            {activity.icon === 'error' && (
                              <RefreshCw className="text-red-500 h-5 w-5" />
                            )}
                            <span className="text-sm font-bold">{activity.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium">{activity.type}</td>
                        <td className="px-6 py-4">
                          {activity.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold">
                              <CheckCircle className="h-3 w-3" /> COMPLETED
                            </span>
                          )}
                          {activity.status === 'progress' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                              <RefreshCw className="h-3 w-3 animate-spin" /> IN PROGRESS
                            </span>
                          )}
                          {activity.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold">
                              <X className="h-3 w-3" /> FAILED
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">{activity.leads} leads</td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">{activity.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
