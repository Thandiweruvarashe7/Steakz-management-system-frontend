import apiClient from '@/lib/axios'
import { useAuthStore } from '@/stores/auth.store'
import type { Reservation } from '@/types'

function branchParam(): Record<string, string> {
  const user = useAuthStore.getState().user
  const params: Record<string, string> = user?.branchId ? { branchId: user.branchId } : {}
  console.log('[BranchParam/Reservations] role:', user?.role, '| branchId:', user?.branchId ?? 'NONE (global role)')
  if (!params.branchId && user?.role !== 'ADMIN' && user?.role !== 'HQ_MANAGER' && user?.role !== 'CUSTOMER' && user?.role) {
    console.warn('[BranchParam/Reservations] WARNING: branch staff has no branchId — data isolation at risk!')
  }
  return params
}

interface BackendReservation {
  id: string
  customerId: string
  branchId: string
  tableId: string
  partySize: number
  reservationDate: string
  status: string
  specialRequests?: string | null
  createdAt: string
  updatedAt: string
  customer?: { id: string; firstName: string; lastName: string; email: string }
  branch?: { id: string; name: string }
  table?: { id: string; tableNumber: number; capacity: number }
}

function normalize(r: BackendReservation): Reservation {
  const dt = new Date(r.reservationDate)
  const localDate = (() => {
    const y = dt.getFullYear()
    const mo = String(dt.getMonth() + 1).padStart(2, '0')
    const dy = String(dt.getDate()).padStart(2, '0')
    return `${y}-${mo}-${dy}`
  })()
  return {
    id:              r.id,
    customerId:      r.customerId,
    branchId:        r.branchId,
    date:            localDate,
    time:            dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    partySize:       r.partySize,
    status:          r.status as Reservation['status'],
    specialRequests: r.specialRequests ?? undefined,
    branchName:      r.branch?.name,
    tableNumber:     r.table?.tableNumber,
    customerName:    r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : undefined,
    customerEmail:   r.customer?.email,
    createdAt:       r.createdAt,
    updatedAt:       r.updatedAt,
  }
}

export const reservationService = {
  async getReservations(params?: Record<string, string>): Promise<Reservation[]> {
    const user = useAuthStore.getState().user
    console.log('[BranchIsolation] Fetching reservations — role:', user?.role ?? 'guest', '| branchId:', user?.branchId ?? 'ALL')
    const { data } = await apiClient.get<{ success: boolean; reservations: BackendReservation[] }>(
      '/reservations',
      { params: { ...branchParam(), ...params } }
    )
    const reservations = (data.reservations ?? []).map(normalize)
    console.log('[Reservations] getReservations — received', reservations.length, 'reservations')
    return reservations
  },

  async getReservationById(id: string): Promise<Reservation> {
    const { data } = await apiClient.get<{ success: boolean; reservation: BackendReservation }>(
      `/reservations/${id}`
    )
    return normalize(data.reservation)
  },

  async createReservation(body: { branchId: string; tableId?: string; reservationDate: string; partySize: number; specialRequests?: string }): Promise<Reservation> {
    console.log('[Reservations] createReservation — branchId:', body.branchId, '| date:', body.reservationDate, '| partySize:', body.partySize, '| tableId:', body.tableId ?? 'auto-assign')
    const { data } = await apiClient.post<{ success: boolean; reservation: BackendReservation }>(
      '/reservations',
      body
    )
    console.log('[Reservations] createReservation — created reservation:', data.reservation?.id)
    return normalize(data.reservation)
  },

  async updateReservation(id: string, body: Partial<{ status: string; partySize: number; reservationDate: string }>): Promise<Reservation> {
    console.log('[Reservations] updateReservation:', id, body)
    const { data } = await apiClient.patch<{ success: boolean; reservation: BackendReservation }>(
      `/reservations/${id}`,
      body
    )
    return normalize(data.reservation)
  },

  async cancelReservation(id: string): Promise<Reservation> {
    console.log('[Reservations] cancelReservation:', id)
    const { data } = await apiClient.delete<{ success: boolean; reservation: BackendReservation }>(
      `/reservations/${id}`
    )
    return normalize(data.reservation)
  },
}
