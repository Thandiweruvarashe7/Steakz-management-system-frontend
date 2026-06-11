export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  code: string
  statusCode: number
  details?: Record<string, string[]>
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface DateRange {
  from: string
  to: string
}

export interface AnalyticsSummary {
  totalRevenue: number
  totalOrders: number
  totalCovers: number
  averageCheckSize: number
  period: string
  revenueChange: number
  ordersChange: number
  coversChange: number
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  orders: number
  covers: number
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  details?: string
  ipAddress: string
  createdAt: string
}
