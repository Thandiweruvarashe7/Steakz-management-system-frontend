import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  change?: number
  className?: string
}

export function StatsCard({ icon: Icon, label, value, change, className }: StatsCardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isNeutral = change === 0

  return (
    <div className={cn('bg-white rounded-xl p-6 border border-gray-100 shadow-sm', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-maroon font-serif">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-beige flex items-center justify-center">
          <Icon className="w-6 h-6 text-maroon" />
        </div>
      </div>
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 mt-3 text-sm',
          isPositive && 'text-green-600',
          isNegative && 'text-red-600',
          isNeutral && 'text-gray-500'
        )}>
          {isPositive && <TrendingUp className="w-4 h-4" />}
          {isNegative && <TrendingDown className="w-4 h-4" />}
          {isNeutral && <Minus className="w-4 h-4" />}
          <span>
            {isPositive ? '+' : ''}{change}% from last period
          </span>
        </div>
      )}
    </div>
  )
}
