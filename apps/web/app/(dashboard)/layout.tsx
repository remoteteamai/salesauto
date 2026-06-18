'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { LayoutDashboard, Bell, Users, Mail, Settings, Zap, ChevronLeft, ChevronRight, Menu, X, Globe } from 'lucide-react'

const sidebarItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Alerts History', href: '/alerts', icon: Bell },
  { title: 'Prospects', href: '/prospects', icon: Users },
  { title: 'Sequences', href: '/sequences', icon: Mail },
  { title: 'Enrichment', href: '/enrichment', icon: Zap },
  { title: 'Integrations', href: '/integrations', icon: Globe },
  { title: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex border-r border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 flex-col transition-all duration-300',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold tracking-tight text-indigo-500">Melioro AI</h1>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-500'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 overflow-hidden">
              <span className="text-sm font-bold text-indigo-500">AR</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Enterprise</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Alex Rivera</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 shadow-xl">
            <div className="p-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
              <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-indigo-500">Melioro AI</h1>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <div
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                        isActive
                          ? 'bg-indigo-500/10 text-indigo-500'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-4 md:px-8 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-indigo-500 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative w-full max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                placeholder="Search alerts, companies or prospects..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors relative">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200/50 dark:bg-slate-700 mx-2 hidden sm:block"></div>
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
              >
                {theme === 'dark' ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
