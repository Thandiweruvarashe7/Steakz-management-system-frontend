import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-beige flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-maroon opacity-60" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-maroon mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2 bg-maroon text-white rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
