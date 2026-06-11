import type { MenuItem } from './menu'

export type OrderStatus =
  | 'PENDING'
  | 'PREPARING'
  | 'READY'
  | 'SERVED'
  | 'PAID'
  | 'CANCELLED'

export type PaymentMethod = 'CARD' | 'CASH' | 'SPLIT' | 'APPLE_PAY' | 'GOOGLE_PAY'

export type PaymentStatus = 'UNPAID' | 'PROCESSING' | 'PAID'

export interface OrderItem {
  id: string
  menuItemId: string
  menuItem: MenuItem
  quantity: number
  notes?: string
  cookingPreference?: string
  price: number
  unitPrice?: number | string
}

export interface Order {
  id: string
  tableId: string
  tableNumber?: number
  waiterId: string
  waiterName?: string
  customerName?: string
  branchId: string
  status: OrderStatus
  paymentStatus?: PaymentStatus
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod?: PaymentMethod
  createdAt: string
  updatedAt: string
}

export interface OrderFilters {
  status?: OrderStatus
  branchId?: string
  date?: string
  page?: number
  limit?: number
}

export interface CreateOrderData {
  tableId: string
  branchId: string
  items: {
    menuItemId: string
    quantity: number
    notes?: string
    cookingPreference?: string
  }[]
}
