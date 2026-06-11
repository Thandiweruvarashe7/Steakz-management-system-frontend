import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Users, ShoppingCart, DollarSign, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { BranchComparisonChart } from '@/components/charts/BranchComparisonChart'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { formatCurrency } from '@/lib/utils'
import apiClient from '@/lib/axios'

interface LiveBranchStat {
  id?: string
  branchId?: string
  name: string
  revenue: number
  orders: number
  covers?: number
  avgCheck?: number
  staff?: number
}

export function BranchAnalyticsPage() {
  const [selectedBranch, setSelectedBranch] = useState('all')

  // Separate query: always load the full branch list for the dropdown.
  // This stays populated even when the main query is filtered to one branch.
  const { data: branchListData } = useQuery({
    queryKey: ['branches-list'],
    queryFn: async () => {
      const response = await apiClient.get('/branches')
      console.log('[BranchAnalytics] Branch list loaded:', response.data?.branches?.length ?? 0)
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const allBranchOptions: { id: string; name: string }[] = branchListData?.branches ?? []

  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ['hq-dashboard', selectedBranch],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (selectedBranch !== 'all') params.branchId = selectedBranch
      console.log('[BranchAnalytics] Fetching GET /analytics/hq-dashboard', params)
      const response = await apiClient.get('/analytics/hq-dashboard', { params })
      console.log('[BranchAnalytics] HQ dashboard data received:', response.data)
      return response.data
    },
    staleTime: 30_000,
    refetchOnMount: false,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
  })

  // Normalize raw branches: API may return totalRevenue/totalOrders or revenue/orders
  const rawBranches: any[] =
    analyticsData?.branches ??
    analyticsData?.dashboard?.branches ??
    []

  const allBranchStats: LiveBranchStat[] = rawBranches.map((b) => ({
    id: b.id,
    branchId: b.branchId ?? b.id,
    name: b.name,
    revenue: Number(b.revenue ?? b.totalRevenue ?? 0),
    orders: Number(b.orders ?? b.totalOrders ?? 0),
    covers: Number(b.covers ?? 0),
    avgCheck: b.avgCheck,
    staff: b.staff ?? b.staffCount,
  }))

  const branchStats: LiveBranchStat[] =
    selectedBranch === 'all'
      ? allBranchStats
      : allBranchStats.filter((b) => b.id === selectedBranch || b.branchId === selectedBranch)

  // Full network list for the performance % baseline.
  // API returns allBranches (always all 5) alongside the filtered branches array.
  const rawAllBranches: any[] =
    analyticsData?.allBranches ??
    analyticsData?.dashboard?.allBranches ??
    rawBranches  // fallback: same source as allBranchStats when old response shape

  const allBranchesForPct: LiveBranchStat[] = rawAllBranches.map((b) => ({
    id: b.id,
    branchId: b.branchId ?? b.id,
    name: b.name,
    revenue: Number(b.revenue ?? b.totalRevenue ?? 0),
    orders: Number(b.orders ?? b.totalOrders ?? 0),
    covers: Number(b.covers ?? 0),
  }))

  // Stable variable for the chart — avoids recreating the value inline in JSX
  const chartBranchId = selectedBranch !== 'all' ? selectedBranch : undefined

  // maxRevenue is always relative to the highest-revenue branch across the whole network
  const maxRevenue = Math.max(...allBranchesForPct.map((x) => Number(x.revenue ?? 0)), 1)

  console.log('[BranchAnalytics] Branch stats:', branchStats.length, 'branches | filter:', selectedBranch, '| maxRevenue (network):', maxRevenue)

  const totals = branchStats.reduce(
    (acc, b) => ({
      revenue: acc.revenue + (b.revenue ?? 0),
      orders: acc.orders + (b.orders ?? 0),
      covers: acc.covers + (b.covers ?? 0),
    }),
    { revenue: 0, orders: 0, covers: 0 }
  )

  return (
    <div>
      <PageHeader
        title="Branch Analytics"
        subtitle="Cross-branch performance — live from PostgreSQL"
        action={
          <div className="flex items-center gap-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
            >
              <option value="all">All Branches</option>
              {allBranchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600 hover:border-maroon hover:text-maroon transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatsCard icon={TrendingUp} label="Total Revenue (Week)" value={isLoading ? '…' : formatCurrency(totals.revenue)} change={8} />
        <StatsCard icon={ShoppingCart} label="Total Orders" value={isLoading ? '…' : String(totals.orders)} change={5} />
        <StatsCard icon={Users} label="Total Covers" value={isLoading ? '…' : String(totals.covers)} change={3} />
        <StatsCard
          icon={DollarSign}
          label="Avg. Check Size"
          value={isLoading ? '…' : formatCurrency(totals.orders > 0 ? totals.revenue / totals.orders : 0)}
          change={2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {branchStats.length === 0 ? (
          <div className="lg:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-5 text-center text-sm text-amber-700">
            No branch data yet. Data will appear here once customers place orders and make reservations.
          </div>
        ) : (
          <BranchComparisonChart data={branchStats.map((b: LiveBranchStat) => ({
            branch: b.name,
            revenue: Number(b.revenue ?? 0),
            orders: Number(b.orders ?? 0),
            covers: Number(b.covers ?? 0),
          }))} />
        )}
        <RevenueChart
          title={chartBranchId ? 'Branch Revenue Trend' : 'Network Revenue Trend'}
          branchId={chartBranchId}
          days={7}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-serif font-semibold text-maroon">Branch Breakdown</h3>
          {!isLoading && branchStats.length === 0 && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">No branch data returned from API</span>
          )}
        </div>
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse text-sm">Loading branch data…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-beige">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Branch</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Revenue</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Orders</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">
                  <div className="flex items-center gap-1">
                    <span>Covers</span>
                    <span
                      title="Covers = total guests served based on reservation party sizes"
                      className="text-gray-400 cursor-help text-xs border border-gray-300 rounded-full w-4 h-4 flex items-center justify-center leading-none"
                    >?</span>
                  </div>
                </th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Avg. Check</th>
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {branchStats.map((b) => {
                const revenue = Number(b.revenue ?? 0)
                const orders = Number(b.orders ?? 0)
                const covers = Number(b.covers ?? 0)
                const avgCheck = Number(b.avgCheck ?? (orders > 0 ? revenue / orders : 0))
                const pct = Math.round((revenue / maxRevenue) * 100)
                return (
                  <tr key={b.id ?? b.branchId ?? b.name} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-800">STEAKZ {b.name}</td>
                    <td className="px-5 py-3.5 font-semibold text-maroon">{formatCurrency(revenue)}</td>
                    <td className="px-5 py-3.5 text-gray-600">{orders}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      <span title="Guests served (sum of reservation party sizes)">{covers}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{formatCurrency(avgCheck)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-gold h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {branchStats.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No branch data available. Ensure orders have been placed and the analytics endpoint is running.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
