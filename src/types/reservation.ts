import type { User } from './auth'
import type { Table } from './table'

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SEATED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export interface Reservation {
  id: string
  customerId: string
  branchId: string
  tableId?: string
  date: string
  time: string
  partySize: number
  status: ReservationStatus
  specialRequests?: string
  customer?: User
  table?: Table
  branchName?: string
  tableNumber?: number
  customerName?: string
  customerEmail?: string
  createdAt: string
  updatedAt: string
}

export interface ReservationFilters {
  status?: ReservationStatus
  branchId?: string
  date?: string
  search?: string
  page?: number
  limit?: number
}

export interface CreateReservationData {
  branchId: string
  date: string
  time: string
  partySize: number
  specialRequests?: string
}

export interface TimeSlot {
  time: string
  available: boolean
}
