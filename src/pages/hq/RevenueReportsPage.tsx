import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Download, Printer, FileText, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { BranchComparisonChart } from '@/components/charts/BranchComparisonChart'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { analyticsService, type HQDashboard } from '@/services/analytics.service'
import apiClient from '@/lib/axios'

function exportCSV(dashboard: HQDashboard) {
  console.log('[RevenueReports] Exporting CSV from backend data')
  const rows = [
    ['Branch', 'Revenue', 'Orders', 'Reservations', 'Staff', 'Monthly Salary'],
    ...dashboard.branches.map((b) => [
      b.name,
      b.totalRevenue.toFixed(2),
      b.totalOrders,
      b.upcomingReservations,
      b.staffCount,
      b.monthlySalaryBudget.toFixed(2),
    ]),
  ]
  const csv = rows.map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `steakz-revenue-report-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function printReport(hq: HQDashboard | undefined) {
  if (!hq || hq.branches.length === 0) {
    toast({ title: 'No data to print', description: 'Please wait for data to load.', variant: 'destructive' })
    return
  }
  console.log('[RevenueReports] Printing report with', hq.branches.length, 'branches')
  setTimeout(() => window.print(), 300)
}

export function RevenueReportsPage() {
  const [selectedBranch, setSelectedBranch] = useState('all')

  const { data: branchesData } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      console.log('[RevenueReports] Fetching GET /branches')
      const response = await apiClient.get('/branches')
      return response.data.branches ?? response.data ?? []
    },
    staleTime: 60_000,
  })
  const branches: { id: string; name: string }[] = branchesData ?? []

  const { data: hq, isLoading, error } = useQuery({
    queryKey: ['hq-dashboard', selectedBranch],
    queryFn: () => analyticsService.getHQDashboard(selectedBranch !== 'all' ? selectedBranch : undefined),
    staleTime: 30_000,
    refetchOnMount: false,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
  })

  // When a specific branch is selected the API returns that branch's totals directly
  const ytdRevenue = hq?.totalRevenue ?? 0
  const monthRevenue = hq?.monthRevenue ?? 0
  const totalOrders = hq?.totalOrders ?? 0
  const avgOrderValue = totalOrders > 0 ? ytdRevenue / totalOrders : 0

  // Stable variable for the chart prop — avoids recreating the value inline in JSX
  const chartBranchId = selectedBranch !== 'all' ? selectedBranch : undefined

  // Filter branches table to selected branch (API already filters but guard client-side too)
  const displayBranches = selectedBranch === 'all'
    ? (hq?.branches ?? [])
    : (hq?.branches ?? []).filter((b) => b.id === selectedBranch)

  console.log('[RevenueReports] HQ dashboard loaded:', { ytdRevenue, monthRevenue, totalOrders, selectedBranch })

  return (
    <div>
      <style>{`
        @media print {
          /* Hide all navigation, sidebar, buttons */
          nav, aside, header,
          [class*="sidebar"], [class*="Sidebar"],
          [class*="layout"], [class*="Layout"],
          button, .no-print {
            display: none !important;
          }

          /* Make main content full width */
          body { margin: 0 !important; }
          main, [class*="main"], [class*="content"] {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          /* Hide charts — they render blank when printing */
          canvas, [class*="Chart"], [class*="chart"],
          .recharts-wrapper, .recharts-surface {
            display: none !important;
          }

          /* Style the data table beautifully for print */
          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #999;
            padding: 8px 12px;
            text-align: left;
            font-size: 11px;
            color: #000 !important;
          }
          thead th {
            background-color: #f0f0f0 !important;
            font-weight: bold;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          tfoot td {
            background-color: #f0f0f0 !important;
            font-weight: bold;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Show all text content */
          * { visibility: visible !important; }

          @page {
            margin: 1.5cm;
            size: A4 landscape;
          }
        }
      `}</style>

      <PageHeader
        title="Revenue Reports"
        subtitle="Network-wide financial performance — live from PostgreSQL"
        action={
          <div className="flex items-center gap-2 no-print">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <button
              onClick={() => printReport(hq)}
              className="flex items-center gap-2 border border-maroon text-maroon px-3 py-2 rounded-lg text-sm font-medium hover:bg-beige transition-colors"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={() => hq && exportCSV(hq)}
              disabled={!hq}
              className="flex items-center gap-2 bg-maroon text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        }
      />

      {error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm no-print">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Could not load revenue data. Check the backend server is running.
        </div>
      ) : null}

      {/* Print-only header — hidden on screen, visible when printing */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">STEAKZ UK — Revenue Report</h1>
        <p className="text-sm text-gray-500">
          Generated: {new Date().toLocaleString('en-GB')} ·{' '}
          Total Revenue: {formatCurrency(ytdRevenue)} ·{' '}
          Total Orders: {totalOrders}
        </p>
        <hr className="my-3" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatsCard icon={TrendingUp} label="Total Revenue" value={isLoading ? '...' : formatCurrency(ytdRevenue)} />
        <StatsCard icon={TrendingUp} label="This Month" value={isLoading ? '...' : formatCurrency(monthRevenue)} />
        <StatsCard icon={TrendingUp} label="Total Orders" value={isLoading ? '...' : totalOrders.toLocaleString()} />
        <StatsCard icon={TrendingUp} label="Avg. Order Value" value={isLoading ? '...' : formatCurrency(avgOrderValue)} />
      </div>

      {/* Charts — hidden when printing (canvas renders blank) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 no-print">
        <RevenueChart
          title={chartBranchId ? 'Branch Revenue Trend' : 'Network Revenue Trend'}
          branchId={chartBranchId}
          days={7}
        />
        <BranchComparisonChart
          title="Branch Revenue Comparison"
          data={(hq?.branches ?? []).map((b: { name: string; totalRevenue: number; totalOrders: number; covers?: number }) => ({
            branch: b.name,
            revenue: Number(b.totalRevenue ?? 0),
            orders: Number(b.totalOrders ?? 0),
            covers: Number(b.covers ?? 0),
          }))}
        />
      </div>

      {/* Per-branch breakdown — always visible including in print */}
      {hq && displayBranches.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2 no-print">
            <FileText className="w-4 h-4 text-maroon" />
            <h3 className="font-serif font-semibold text-maroon">Branch Performance — Live Data</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-beige">
              <tr>
                {['Branch', 'Total Revenue', 'Orders', 'Reservations', 'Staff', 'Monthly Salaries'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{branch.name}</td>
                  <td className="px-5 py-3 font-semibold text-maroon">{formatCurrency(branch.totalRevenue)}</td>
                  <td className="px-5 py-3 text-gray-600">{branch.totalOrders.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-600">{branch.upcomingReservations}</td>
                  <td className="px-5 py-3 text-gray-600">{branch.staffCount}</td>
                  <td className="px-5 py-3 text-gray-600">{formatCurrency(branch.monthlySalaryBudget)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-beige">
              <tr>
                <td className="px-5 py-3 font-bold text-maroon">Network Total</td>
                <td className="px-5 py-3 font-bold text-maroon">{formatCurrency(ytdRevenue)}</td>
                <td className="px-5 py-3 font-bold text-maroon">{totalOrders.toLocaleString()}</td>
                <td className="px-5 py-3 font-bold text-maroon">{hq.upcomingReservations}</td>
                <td className="px-5 py-3 font-bold text-maroon">{hq.totalStaff}</td>
                <td className="px-5 py-3 font-bold text-maroon">{formatCurrency(hq.monthlySalaryBudget)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Data sourced from PostgreSQL · {hq?.timestamp ? new Date(hq.timestamp).toLocaleString() : ''}
      </p>
    </div>
  )
}
