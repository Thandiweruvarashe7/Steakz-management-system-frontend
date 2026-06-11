import type { TableStatus, OrderStatus, ReservationStatus, StockLevel } from '@/types'

export const TABLE_STATUS_COLORS: Record<TableStatus, string> = {
  AVAILABLE: '#22c55e',
  RESERVED: '#f97316',
  OCCUPIED: '#ef4444',
  PAYMENT_PENDING: '#3b82f6',
}

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  OCCUPIED: 'Occupied',
  PAYMENT_PENDING: 'Payment Pending',
}

export const TABLE_STATUS_BADGE: Record<TableStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
  RESERVED: 'bg-orange-100 text-orange-800 border-orange-200',
  OCCUPIED: 'bg-red-100 text-red-800 border-red-200',
  PAYMENT_PENDING: 'bg-blue-100 text-blue-800 border-blue-200',
}

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PREPARING: 'bg-orange-100 text-orange-800 border-orange-200',
  READY: 'bg-blue-100 text-blue-800 border-blue-200',
  SERVED: 'bg-green-100 text-green-800 border-green-200',
  PAID: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
}

export const RESERVATION_STATUS_BADGE: Record<ReservationStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  SEATED: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  NO_SHOW: 'bg-purple-100 text-purple-800 border-purple-200',
}

export const STOCK_LEVEL_BADGE: Record<StockLevel, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  LOW: 'bg-orange-100 text-orange-800 border-orange-200',
  NORMAL: 'bg-green-100 text-green-800 border-green-200',
  HIGH: 'bg-blue-100 text-blue-800 border-blue-200',
}
