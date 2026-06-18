'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: number
  change: number
  format: 'number' | 'currency' | 'percentage'
  icon: LucideIcon
  iconColor?: string
}

export function KpiCard({
  title,
  value,
  change,
  format,
  icon: Icon,
  iconColor = 'text-primary',
}: KpiCardProps) {
  const isPositive = change >= 0
  const formattedValue = {
    number: formatNumber(value),
    currency: formatCurrency(value),
    percentage: formatPercentage(value),
  }[format]

  const formattedChange = isPositive ? `+${change}%` : `${change}%`

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{formattedValue}</p>
            <div className="flex items-center mt-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositive ? 'text-green-500' : 'text-red-500'
                )}
              >
                {formattedChange}
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last month</span>
            </div>
          </div>
          <div
            className={cn(
              'p-3 rounded-full bg-primary/10',
              iconColor.includes('[') ? '' : ''
            )}
          >
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
