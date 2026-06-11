import apiClient from '@/lib/axios'
import { useAuthStore } from '@/stores/auth.store'

function branchParam(): Record<string, string> {
  const user = useAuthStore.getState().user
  const params: Record<string, string> = user?.branchId ? { branchId: user.branchId } : {}
  console.log(`[BranchSecurity/Staff] Role: ${user?.role ?? 'guest'} | BranchId: ${user?.branchId ?? 'ALL (admin/hq)'}`)
  return params
}

export interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  branchId?: string | null
  employeeId?: string
  salary?: number | string | null
  shift?: string | null
  employeeStatus?: string | null
  dateJoined?: string | null
  teamAssignment?: string | null
  createdAt: string
  branch?: { id: string; name: string } | null
}

export const staffService = {
  async getStaff(params?: Record<string, string>): Promise<StaffMember[]> {
    const { data } = await apiClient.get<{ success: boolean; users: StaffMember[] }>(
      '/users',
      { params: { ...branchParam(), ...params } }
    )
    const staff = data.users ?? []
    console.log('[Staff] getStaff — received', staff.length, 'staff members')
    return staff
  },

  async createStaff(body: { firstName: string; lastName: string; email: string; password: string; role: string; branchId?: string; salary?: number; shift?: string }): Promise<StaffMember> {
    console.log('[Staff] createStaff:', body.email, '| role:', body.role, '| branchId:', body.branchId)
    const { data } = await apiClient.post<{ success: boolean; user: StaffMember }>('/users', body)
    return data.user
  },

  async updateStaff(id: string, body: Partial<{ role: string; branchId: string; salary: number; shift: string; employeeStatus: string }>): Promise<StaffMember> {
    console.log('[Staff] updateStaff:', id, body)
    const { data } = await apiClient.patch<{ success: boolean; user: StaffMember }>(`/users/${id}`, body)
    return data.user
  },

  async deleteStaff(id: string): Promise<{ deletedEmail?: string; success?: boolean }> {
    console.log('[Staff] deleteStaff:', id)
    const { data } = await apiClient.delete<{ success?: boolean; deletedEmail?: string; message?: string }>(`/users/${id}`)
    console.log('[Staff] deleteStaff response:', data)
    return data ?? {}
  },
}
