export type PayrollStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PAID'

export interface PayrollEntry {
  id: string
  staffId: string
  staffName: string
  branchId: string
  branchName: string
  period: string
  hoursWorked: number
  hourlyRate: number
  basePay: number
  bonus?: number
  deductions?: number
  totalPay: number
  status: PayrollStatus
}

export interface PayrollSummary {
  period: string
  totalStaff: number
  totalHours: number
  totalPay: number
  branchBreakdown: {
    branchId: string
    branchName: string
    staffCount: number
    totalPay: number
  }[]
}
