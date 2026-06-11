import { useQuery, keepPreviousData } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import apiClient from '@/lib/axios'
import type { RevenueDataPoint } from '@/types'

// Fallback only — used while loading or if fetch fails
const MOCK_REVENUE: RevenueDataPoint[] = [
  { date: 'Mon', revenue: 4200, orders: 42, covers: 95 },
  { date: 'Tue', revenue: 3800, orders: 38, covers: 80 },
  { date: 'Wed', revenue: 5100, orders: 51, covers: 112 },
  { date: 'Thu', revenue: 4700, orders: 47, covers: 105 },
  { date: 'Fri', revenue: 7200, orders: 72, covers: 168 },
  { date: 'Sat', revenue: 8900, orders: 89, covers: 210 },
  { date: 'Sun', revenue: 6500, orders: 65, covers: 148 },
]

function formatDateLabel(raw: string): string {
  if (!raw) return raw
  // Already a short label like Mon/Tue — pass through
  if (raw.length <= 5 && !/\d/.test(raw)) return raw
  // Extract the YYYY-MM-DD portion (works for both "2026-06-10" and "2026-06-10T00:00:00.000Z")
  const datePart = raw.slice(0, 10)
  const parts = datePart.split('-')
  if (parts.length === 3) {
    // Return DD-MM (e.g. "10-06" for 10 June) — deterministic, no locale, no timezone issues
    return `${parts[2]}-${parts[1]}`
  }
  return raw
}

interface RevenueChartProps {
  data?: RevenueDataPoint[]
  title?: string
  branchId?: string
  days?: number
}

export function RevenueChart({ data: dataProp, title = 'Revenue This Week', branchId, days = 7 }: RevenueChartProps) {
  const { data: liveData } = useQuery({
    queryKey: ['revenue-trend', branchId ?? 'all', days],
    queryFn: async () => {
      const params: Record<string, string | number> = { days }
      if (branchId) params.branchId = branchId
      console.log('[RevenueChart] Fetching GET /analytics/revenue', params)
      const response = await apiClient.get('/analytics/revenue', { params })
      const raw = response.data
      // Validate this is a real analytics response (has 'series' key or is an array)
      // If it lacks 'series' it's likely a rate-limit fallback — throw so TanStack keeps previous data
      const hasValidShape = raw && (Array.isArray(raw) || 'series' in raw || 'data' in raw)
      if (!hasValidShape) {
        console.warn('[RevenueChart] Response missing series key — likely a bad response, preserving previous data')
        throw new Error('Invalid analytics response shape')
      }
      const series: RevenueDataPoint[] =
        raw?.series ?? (Array.isArray(raw) ? raw : raw?.data ?? [])
      console.log('[RevenueChart] Revenue series received:', series.length, 'points | branchId:', branchId ?? 'all')
      return series.map((p: RevenueDataPoint) => ({
        ...p,
        date: formatDateLabel(p.date),
      }))
    },
    staleTime: 30_000,
    gcTime: 300_000,
    placeholderData: keepPreviousData,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })

  const chartData: RevenueDataPoint[] =
    liveData && liveData.length > 0
      ? liveData
      : (dataProp ?? MOCK_REVENUE)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-serif font-semibold text-maroon mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `£${(v / 1000).toFixed(1)}k`} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'revenue') return [formatCurrency(value as number), 'Revenue']
              return [value, name]
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#6D071A"
            strokeWidth={2}
            dot={{ fill: '#6D071A', r: 4 }}
            name="revenue"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

