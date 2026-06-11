import { Users, CalendarDays, ShoppingCart, Plus, MapPin, AlertCircle, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatsCard } from '@/components/ui/StatsCard'
import { RevenueChart } from '@/components/charts/RevenueChart'
import { OrdersChart } from '@/components/charts/OrdersChart'
import { analyticsService } from '@/services/analytics.service'
import { useAuth } from '@/hooks/useAuth'

export function ManagerDashboardPage() {
  const { user } = useAuth()
  const branchId = user?.branchId ?? undefined

  const { data: dashboard, isLoading, error, refetch } = useQuery({
    queryKey: ['branch-dashboard', user?.branchId],
    queryFn: () => {
      console.log('[ManagerDashboard] Fetching branch dashboard for:', user?.branchId)
      return analyticsService.getBranchDashboard(user?.branchId)
    },
    refetchInterval: 30_000,
    staleTime: 30_000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

  console.log('[ManagerDashboard] Dashboard data:', dashboard)

  return (
    <div>
      <PageHeader
        title="Branch Dashboard"
        subtitle={`Today's live overview — ${user?.branchId ? 'Your Branch' : 'All Branches'}`}
        action={
          <button onClick={() => refetch()} disabled={isLoading}
            className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600 hover:border-maroon hover:text-maroon transition-colors">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Could not load dashboard stats. Check the backend server is running.
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard icon={Users} label="Staff on Shift" value={isLoading ? '…' : String(dashboard?.staffOnShift ?? 0)} />
        <StatsCard icon={CalendarDays} label="Reservations Today" value={isLoading ? '…' : String(dashboard?.todayReservations ?? 0)} />
        <StatsCard icon={ShoppingCart} label="Active Orders" value={isLoading ? '…' : String(dashboard?.activeOrders ?? 0)} />
      </div>

      {/* Tables status */}
      {dashboard && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{dashboard.tablesAvailable}</p>
            <p className="text-xs text-gray-500 mt-1">Tables Available</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-maroon">{dashboard.tablesOccupied}</p>
            <p className="text-xs text-gray-500 mt-1">Tables Occupied</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{dashboard.tablesReserved}</p>
            <p className="text-xs text-gray-500 mt-1">Tables Reserved</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart title="Revenue This Week" branchId={branchId} days={7} />
        <OrdersChart />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-serif font-semibold text-maroon mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/branch-manager/reservations" className="flex items-center gap-3 p-3 rounded-lg hover:bg-beige transition-colors text-sm text-gray-700 hover:text-maroon">
            <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center"><Plus className="w-4 h-4 text-maroon" /></div>
            New Reservation
          </Link>
          <Link to="/branch-manager/inventory" className="flex items-center gap-3 p-3 rounded-lg hover:bg-beige transition-colors text-sm text-gray-700 hover:text-maroon">
            <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-maroon" /></div>
            Check Inventory
          </Link>
          <Link to="/branch-manager/staff" className="flex items-center gap-3 p-3 rounded-lg hover:bg-beige transition-colors text-sm text-gray-700 hover:text-maroon">
            <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center"><Users className="w-4 h-4 text-maroon" /></div>
            View Staff
          </Link>
          <Link to="/branch-manager/sales" className="flex items-center gap-3 p-3 rounded-lg hover:bg-beige transition-colors text-sm text-gray-700 hover:text-maroon">
            <div className="w-8 h-8 rounded-lg bg-beige flex items-center justify-center"><MapPin className="w-4 h-4 text-maroon" /></div>
            Sales Report
          </Link>
        </div>
      </div>
    </div>
  )
}
