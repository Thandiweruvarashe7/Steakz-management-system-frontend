import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, DollarSign, Users, ShoppingCart, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { OrdersChart } from '@/components/charts/OrdersChart'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import apiClient from '@/lib/axios'

const CATEGORY_BREAKDOWN_FALLBACK = [
  { category: 'Steaks', items: 0, revenue: 0 },
  { category: 'Starters', items: 0, revenue: 0 },
  { category: 'Mains', items: 0, revenue: 0 },
  { category: 'Desserts', items: 0, revenue: 0 },
  { category: 'Drinks', items: 0, revenue: 0 },
]

export function SalesPage() {
  const { user } = useAuth()
  const branchId = user?.branchId ?? undefined

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['sales-report', startDate, endDate, user?.branchId],
    queryFn: async () => {
      console.log('[SalesPage] Fetching GET /analytics/sales', { startDate, endDate, branchId: user?.branchId })
      try {
        const response = await apiClient.get('/analytics/sales', {
          params: { startDate, endDate, branchId: user?.branchId }
        })
        console.log('[SalesPage] Sales data received:', response.data)
        return response.data
      } catch (err) {
        console.warn('[SalesPage] /analytics/sales not available, trying /analytics/branch-dashboard:', err)
        try {
          const fallback = await apiClient.get('/analytics/branch-dashboard', {
            params: { branchId: user?.branchId }
          })
          console.log('[SalesPage] Branch dashboard fallback:', fallback.data)
          return fallback.data
        } catch (err2) {
          console.warn('[SalesPage] Both endpoints unavailable:', err2)
          return null
        }
      }
    },
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: 30_000,
  })

  const rawCategories = data?.categories ?? data?.categoryBreakdown ?? null
  const categories: Array<{ category: string; items: number; revenue: number }> =
    Array.isArray(rawCategories)
      ? rawCategories
      : rawCategories && typeof rawCategories === 'object'
        ? Object.entries(rawCategories).map(([category, vals]) => ({
            category,
            items: (vals as { items?: number }).items ?? 0,
            revenue: (vals as { revenue?: number }).revenue ?? 0,
          }))
        : CATEGORY_BREAKDOWN_FALLBACK

  const totalRevenue = data?.totalRevenue ?? data?.weekRevenue ?? categories.reduce((s: number, c: { revenue: number }) => s + c.revenue, 0)
  const totalOrders = data?.totalOrders ?? data?.weekOrders ?? 0
  const totalCovers = data?.totalCovers ?? data?.weekCovers ?? 0
  const avgCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const grandTotal = categories.reduce((s: number, c: { revenue: number }) => s + c.revenue, 0)

  return (
    <div>
      <PageHeader
        title="Sales Report"
        subtitle="Branch performance — live from PostgreSQL"
        action={
          <div className="flex items-center gap-3">
            <input type="date" value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
            <span className="text-gray-400 text-sm">to</span>
            <input type="date" value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
            <button onClick={() => refetch()} disabled={isLoading}
              className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600 hover:border-maroon hover:text-maroon transition-colors">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatsCard icon={TrendingUp} label="Period Revenue" value={isLoading ? '…' : formatCurrency(totalRevenue)} />
        <StatsCard icon={ShoppingCart} label="Total Orders" value={isLoading ? '…' : String(totalOrders)} />
        <StatsCard icon={Users} label="Total Covers" value={isLoading ? '…' : String(totalCovers)} />
        <StatsCard icon={DollarSign} label="Avg. Check Size" value={isLoading ? '…' : formatCurrency(avgCheck)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart title="Revenue This Week" branchId={branchId} days={7} />
        <OrdersChart />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-serif font-semibold text-maroon">Sales by Category</h3>
          {!data && !isLoading && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Demo data — backend /analytics/sales not yet available</span>
          )}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-beige">
            <tr>
              {['Category', 'Items Sold', 'Revenue', '% of Total'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm animate-pulse">Loading sales data…</td></tr>
            ) : categories.map((row: { category: string; items: number; revenue: number }) => {
              const pct = grandTotal > 0 ? ((row.revenue / grandTotal) * 100).toFixed(1) : '0.0'
              return (
                <tr key={row.category} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{row.category}</td>
                  <td className="px-5 py-3 text-gray-600">{row.items}</td>
                  <td className="px-5 py-3 font-semibold text-maroon">{formatCurrency(row.revenue)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-gold h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-10">{pct}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
