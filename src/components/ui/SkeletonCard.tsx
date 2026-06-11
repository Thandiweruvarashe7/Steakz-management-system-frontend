import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-xl border border-gray-200 p-4 bg-white', className)}>
      <div className="skeleton h-48 w-full rounded-lg mb-4" />
      <div className="skeleton h-4 w-3/4 rounded mb-2" />
      <div className="skeleton h-3 w-full rounded mb-1" />
      <div className="skeleton h-3 w-2/3 rounded mb-4" />
      <div className="flex justify-between items-center">
        <div className="skeleton h-5 w-16 rounded" />
        <div className="skeleton h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="skeleton h-10 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-14 w-full rounded-lg" />
      ))}
    </div>
  )
}

export function SkeletonList({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-white">
          <div className="skeleton h-12 w-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/2 rounded" />
            <div className="skeleton h-3 w-3/4 rounded" />
          </div>
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}
