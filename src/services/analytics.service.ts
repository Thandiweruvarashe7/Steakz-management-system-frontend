import apiClient from '@/lib/axios'
import type { AnalyticsSummary, RevenueDataPoint, DateRange, AuditLog, PaginatedResponse } from '@/types'

export interface BranchDashboard {
  activeOrders: number
  todayReservations: number
  revenueToday: string
  tablesOccupied: number
  tablesAvailable: number
  tablesReserved: number
  totalTables: number
  staffOnShift: number
  liveOrders: unknown[]
  timestamp: string
}

export interface HQBranchStat {
  id: string
  name: string
  location: string
  totalRevenue: number
  totalOrders: number
  upcomingReservations: number
  staffCount: number
  annualSalaryBudget: number
  monthlySalaryBudget: number
}

export interface HQDashboard {
  totalRevenue: number
  monthRevenue: number
  totalOrders: number
  activeOrders: number
  upcomingReservations: number
  totalStaff: number
  annualSalaryBudget: number
  monthlySalaryBudget: number
  branches: HQBranchStat[]
  timestamp: string
}

export const analyticsService = {
  async getBranchAnalytics(branchId: string, dateRange: DateRange): Promise<AnalyticsSummary> {
    const { data } = await apiClient.get<AnalyticsSummary>(`/analytics/branch/${branchId}`, { params: dateRange })
    return data
  },

  async getAllBranchesAnalytics(dateRange: DateRange): Promise<AnalyticsSummary[]> {
    const { data } = await apiClient.get<AnalyticsSummary[]>('/analytics/all-branches', { params: dateRange })
    return data
  },

  async getRevenueData(branchId: string, dateRange: DateRange): Promise<RevenueDataPoint[]> {
    const { data } = await apiClient.get<RevenueDataPoint[]>('/analytics/revenue', {
      params: { branchId, ...dateRange },
    })
    return data
  },

  async getSalesReport(branchId: string, dateRange: DateRange): Promise<{ category: string; itemsSold: number; revenue: number }[]> {
    const { data } = await apiClient.get<{ category: string; itemsSold: number; revenue: number }[]>(
      '/analytics/sales',
      { params: { branchId, ...dateRange } }
    )
    return data
  },

  async getAuditLogs(filters?: { userId?: string; action?: string; page?: number; limit?: number }): Promise<PaginatedResponse<AuditLog>> {
    const { data } = await apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs', { params: filters })
    return data
  },

  // Branch manager real-time dashboard
  async getBranchDashboard(branchId?: string): Promise<BranchDashboard> {
    console.log('[Analytics] getBranchDashboard — branchId:', branchId)
    const { data } = await apiClient.get<{ success: boolean; dashboard: BranchDashboard }>(
      '/analytics/branch-dashboard',
      { params: branchId ? { branchId } : {} }
    )
    return data.dashboard
  },

  // HQ all-branches overview — pass branchId to filter to a single branch
  async getHQDashboard(branchId?: string): Promise<HQDashboard> {
    const params: Record<string, string> = {}
    if (branchId) params.branchId = branchId
    console.log('[Analytics] getHQDashboard — calling GET /analytics/hq-dashboard', branchId ? `| branchId: ${branchId}` : '| all branches')
    const { data } = await apiClient.get<{ success: boolean; dashboard?: HQDashboard } & Partial<HQDashboard>>(
      '/analytics/hq-dashboard',
      { params }
    )
    console.log('[Analytics] FULL RAW RESPONSE:', JSON.stringify(data, null, 2))
    console.log('[Analytics] getHQDashboard RAW response keys:', Object.keys(data))

    // Support both { dashboard: {...} } and flat { totalRevenue: X, ... } shapes
    const dashboard: HQDashboard = data.dashboard ?? (data as unknown as HQDashboard)

    console.log('[Analytics] getHQDashboard resolved stats:', {
      totalRevenue: dashboard?.totalRevenue,
      monthRevenue: dashboard?.monthRevenue,
      totalOrders: dashboard?.totalOrders,
      activeOrders: dashboard?.activeOrders,
      upcomingReservations: dashboard?.upcomingReservations,
      totalStaff: dashboard?.totalStaff,
      branchCount: dashboard?.branches?.length ?? 0,
    })

    if (!dashboard) {
      console.error('[Analytics] getHQDashboard — MISSING dashboard data! Full response:', JSON.stringify(data).substring(0, 500))
    }
    return dashboard
  },
}
