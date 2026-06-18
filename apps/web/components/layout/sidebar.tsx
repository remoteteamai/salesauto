'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Mail,
  BarChart3,
  Settings,
  Shield,
  ChevronLeft,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Prospects',
    href: '/prospects',
    icon: Users,
  },
  {
    title: 'Campaigns',
    href: '/campaigns',
    icon: Mail,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

const adminItems = [
  {
    title: 'Admin Portal',
    href: '/admin',
    icon: Shield,
  },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold">Melioro AI</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                isCollapsed && 'rotate-180'
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Button>
              </Link>
            )
          })}

          <div className="my-4 border-t" />

          {adminItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          {!isCollapsed && (
            <div className="rounded-lg bg-primary/10 p-3">
              <p className="text-sm font-medium">Need help?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Check our documentation
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
