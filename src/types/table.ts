export type TableStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'PAYMENT_PENDING'

export interface Table {
  id: string
  number: number
  branchId: string
  capacity: number
  status: TableStatus
  x: number
  y: number
  shape: 'round' | 'rectangle'
  currentOrderId?: string
  reservationId?: string
  guestName?: string
}

export interface FloorPlanLayout {
  branchId: string
  tables: Table[]
}
