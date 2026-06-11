import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics.service'
import type { DateRange } from '@/types'

export function useBranchAnalytics(branchId: string, dateRange: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'branch', branchId, dateRange],
    queryFn: () => analyticsService.getBranchAnalytics(branchId, dateRange),
    enabled: !!branchId,
  })
}

export function useAllBranchesAnalytics(dateRange: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'all-branches', dateRange],
    queryFn: () => analyticsService.getAllBranchesAnalytics(dateRange),
  })
}

export function useRevenueData(branchId: string, dateRange: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'revenue', branchId, dateRange],
    queryFn: () => analyticsService.getRevenueData(branchId, dateRange),
    enabled: !!branchId,
  })
}

export function useSalesReport(branchId: string, dateRange: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'sales', branchId, dateRange],
    queryFn: () => analyticsService.getSalesReport(branchId, dateRange),
    enabled: !!branchId,
  })
}

export function useAuditLogs(filters?: { userId?: string; action?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => analyticsService.getAuditLogs(filters),
  })
}
