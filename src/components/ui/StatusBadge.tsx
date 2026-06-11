import { cn } from '@/lib/utils'
import {
  TABLE_STATUS_BADGE,
  TABLE_STATUS_LABELS,
  ORDER_STATUS_BADGE,
  RESERVATION_STATUS_BADGE,
  STOCK_LEVEL_BADGE,
} from '@/constants/colors'
import type { TableStatus, OrderStatus, ReservationStatus, StockLevel } from '@/types'

interface StatusBadgeProps {
  status: TableStatus | OrderStatus | ReservationStatus | StockLevel
  type: 'table' | 'order' | 'reservation' | 'stock'
  className?: string
}

const STATUS_MAPS = {
  table: TABLE_STATUS_BADGE,
  order: ORDER_STATUS_BADGE,
  reservation: RESERVATION_STATUS_BADGE,
  stock: STOCK_LEVEL_BADGE,
}

const TABLE_LABELS = TABLE_STATUS_LABELS

const GENERAL_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PREPARING: 'Preparing',
  READY: 'Ready',
  SERVED: 'Served',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  CONFIRMED: 'Confirmed',
  SEATED: 'Seated',
  COMPLETED: 'Completed',
  NO_SHOW: 'No Show',
  CRITICAL: 'Critical',
  LOW: 'Low Stock',
  NORMAL: 'Normal',
  HIGH: 'High',
  ...TABLE_LABELS,
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const colorMap = STATUS_MAPS[type] as Record<string, string>
  const colorClass = colorMap[status] ?? 'bg-gray-100 text-gray-800 border-gray-200'
  const label = GENERAL_LABELS[status] ?? status

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  )
}
