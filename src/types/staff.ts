import type { Role } from './auth'

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY'
export type StaffStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'

export interface StaffMember {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: Role
  branchId: string
  branchName?: string
  status: StaffStatus
  startDate: string
  hourlyRate?: number
  avatarUrl?: string
}

export interface StaffFilters {
  role?: Role
  status?: StaffStatus
  branchId?: string
  search?: string
  page?: number
  limit?: number
}
