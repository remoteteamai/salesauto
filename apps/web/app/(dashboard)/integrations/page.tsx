'use client'

import { useState } from 'react'
import { 
  Zap, Search, Plus, ChevronRight, Database, Send, BarChart3, Mail, Settings,
  Globe, CheckCircle
} from 'lucide-react'

// Integration categories
const categories = [
  { id: 'all', name: 'All Integrations', icon: Globe, count: 100 },
  { id: 'crm', name: 'CRM', icon: Database, count: 12 },
  { id: 'sales', name: 'Sales Engagement', icon: Send, count: 8 },
  { id: 'data', name: 'Data & Intelligence', icon: BarChart3, count: 15 },
  { id: 'email', name: 'Email Marketing', icon: Mail, count: 10 },
  { id: 'ops', name: 'Operations', icon: Settings, count: 6 },
]

// All integrations by category
const allIntegrations = {
  crm: [
    { id: 'pipedrive', name: 'Pipedrive', logo: 'https://logo.clearbit.com/pipedrive.com', description: 'Streamline your small business sales pipeline with automated data entry.' },
    { id: 'dynamics', name: 'MS Dynamics 365', logo: 'https://logo.clearbit.com/microsoft.com', description: 'Enterprise-grade sync for complex organizational structures.' },
    { id: 'zendesk', name: 'Zendesk Sell', logo: 'https://logo.clearbit.com/zendesk.com', description: 'Connect your sales and support data for a 360-degree view.' },
  ],
  sales: [
    { id: 'outreach', name: 'Outreach.io', logo: 'https://logo.clearbit.com/outreach.io', description: 'Push enriched prospects directly into your Outreach sequences.' },
    { id: 'salesloft', name: 'Salesloft', logo: 'https://logo.clearbit.com/salesloft.com', description: 'Scale your personalized outreach with high quality intelligence data.' },
    { id: 'instantly', name: 'Instantly', logo: 'https://logo.clearbit.com/instantly.ai', description: 'Connect thousands of sender accounts for unlimited scaling.' },
  ],
  data: [
    { id: 'clearbit', name: 'Clearbit', logo: 'https://logo.clearbit.com/clearbit.com', description: 'Automatic enrichment of every new lead that enters your CRM.' },
    { id: '6sense', name: '6sense', logo: 'https://logo.clearbit.com/6sense.com', description: 'Capture intent data and orchestrate account-based marketing efforts.' },
    { id: 'apollo', name: 'Apollo.io', logo: 'https://logo.clearbit.com/apollo.io', description: 'Access millions of accurate emails and direct dials instantly.' },
  ],
  email: [
    { id: 'mailchimp', name: 'Mailchimp', logo: 'https://logo.clearbit.com/mailchimp.com', description: 'Sync contacts and track email campaign performance.' },
    { id: 'sendgrid', name: 'SendGrid', logo: 'https://logo.clearbit.com/sendgrid.com', description: 'Send personalized emails at scale with powerful APIs.' },
  ],
  ops: [
    { id: 'slack', name: 'Slack', logo: 'https://logo.clearbit.com/slack.com', description: 'Get real-time notifications and collaborate with your team.' },
    { id: 'zapier', name: 'Zapier', logo: 'https://logo.clearbit.com/zapier.com', description: 'Connect Melioro AI with 5,000+ apps via no-code automation.' },
  ],
}

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [connectedIds, setConnectedIds] = useState<string[]>(['salesforce', 'hubspot'])

  const toggleConnection = (id: string) => {
    if (connectedIds.includes(id)) {
      setConnectedIds(connectedIds.filter(i => i !== id))
    } else {
      setConnectedIds([...connectedIds, id])
    }
  }

  const isConnected = (id: string) => connectedIds.includes(id)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <a className="flex items-center gap-2" href="/dashboard">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-indigo-500">Melioro AI</span>
              </a>
              <nav className="hidden md:flex items-center gap-6">
                <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors" href="/dashboard">Dashboard</a>
                <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors" href="/enrichment">Enrichment</a>
                <a className="text-sm font-medium text-indigo-500 border-b-2 border-indigo-500 pb-1" href="/integrations">Integrations</a>
                <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors" href="#">API</a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Log In</button>
              <button className="px-4 py-2 bg-indigo-500 text-white text-sm font-semibold rounded-lg hover:bg-indigo-600 transition-shadow shadow-sm">Get Started</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Integration Partners</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Supercharge your sales workflow by connecting Melioro AI with your existing stack. Automate data enrichment, lead routing, and engagement across all your favorite tools.
          </p>
        </div>

        {/* Search and Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Categories</h3>
                <nav className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-indigo-500/10 text-indigo-500 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <cat.icon className="h-5 w-5" />
                      <span className="flex-1 text-left text-sm">{cat.name}</span>
                      <span className="text-xs text-slate-400">{cat.count}</span>
                    </button>
                  ))}
                </nav>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold mb-2">Can&apos;t find an integration?</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Suggest a partner or explore our robust API documentation.</p>
                <button className="w-full py-2 text-xs font-bold border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors">View API Docs</button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="relative mb-10">
              <Search className="absolute inset-y-0 left-0 ml-4 flex items-center text-slate-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                placeholder="Search 100+ integrations (e.g. Salesforce, Outreach, Apollo...)"
              />
            </div>

            {/* Featured Section */}
            {activeCategory === 'all' && (
              <div className="mb-12">
                <h2 className="text-xl font-bold mb-6">Featured Partners</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Featured Bento 1 - Salesforce */}
                  <div className="md:col-span-2 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-8 group">
                    <div className="w-24 h-24 flex-shrink-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center p-4">
                      <img alt="Salesforce" src="https://logo.clearbit.com/salesforce.com" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wider">Top Partner</span>
                        <h3 className="text-2xl font-bold">Salesforce</h3>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">Sync accounts, contacts, and opportunities bidirectionally with the world&apos;s #1 CRM. Keep your pipeline accurate in real-time.</p>
                      <button 
                        onClick={() => toggleConnection('salesforce')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                          isConnected('salesforce')
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/20'
                        }`}
                      >
                        {isConnected('salesforce') ? (
                          <>Connected <CheckCircle className="h-4 w-4" /></>
                        ) : (
                          <>Integrate Now <ChevronRight className="h-4 w-4" /></>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Featured Bento 2 - HubSpot */}
                  <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="w-16 h-16 mb-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm flex items-center justify-center p-3">
                        <img alt="HubSpot" src="https://logo.clearbit.com/hubspot.com" className="w-full h-full object-contain" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">HubSpot</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Seamlessly connect your inbound marketing and sales activities.</p>
                    </div>
                    <button 
                      onClick={() => toggleConnection('hubspot')}
                      className={`mt-8 flex items-center gap-1 font-bold text-sm transition-all ${
                        isConnected('hubspot')
                          ? 'text-green-500'
                          : 'text-indigo-500 hover:gap-2'
                      }`}
                    >
                      {isConnected('hubspot') ? (
                        <>Connected <CheckCircle className="h-4 w-4" /></>
                      ) : (
                        <>Learn more <ChevronRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Directory Grid */}
            <div className="space-y-12">
              {Object.entries(allIntegrations).map(([category, integrations]) => {
                if (activeCategory !== 'all' && activeCategory !== category) return null
                
                const categoryNames: Record<string, string> = {
                  crm: 'Customer Relationship Management (CRM)',
                  sales: 'Sales Engagement',
                  data: 'Data & Intelligence',
                  email: 'Email Marketing',
                  ops: 'Operations',
                }

                return (
                  <section key={category}>
                    <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h2 className="text-lg font-bold">{categoryNames[category]}</h2>
                      <a className="text-sm font-semibold text-indigo-500" href="#">View all</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {integrations.map((integration) => (
                        <div 
                          key={integration.id}
                          className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center p-2">
                              <img alt={integration.name} src={integration.logo} className="w-full h-full object-contain" />
                            </div>
                            <button 
                              onClick={() => toggleConnection(integration.id)}
                              className={`p-2 rounded-full transition-colors ${
                                isConnected(integration.id)
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-500 hover:bg-green-200'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                              }`}
                            >
                              {isConnected(integration.id) ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <Plus className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <h4 className="font-bold mb-1">{integration.name}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{integration.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
