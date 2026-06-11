import apiClient from '@/lib/axios'
import type { PayrollEntry, PayrollSummary } from '@/types'

export const payrollService = {
  async getPayrollEntries(period: string, branchId?: string): Promise<PayrollEntry[]> {
    const { data } = await apiClient.get<PayrollEntry[]>('/payroll', { params: { period, branchId } })
    return data
  },

  async getPayrollSummary(period: string): Promise<PayrollSummary> {
    const { data } = await apiClient.get<PayrollSummary>('/payroll/summary', { params: { period } })
    return data
  },

  async approvePayroll(period: string): Promise<void> {
    await apiClient.post('/payroll/approve', { period })
  },
}
