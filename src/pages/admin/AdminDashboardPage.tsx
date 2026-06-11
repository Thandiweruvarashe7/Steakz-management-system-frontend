import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Users, CalendarDays, ShoppingCart, Building2, DollarSign, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatCurrency } from '@/lib/utils'
import { analyticsService, type HQBranchStat } from '@/services/analytics.service'

export function AdminDashboardPage() {
  const { data: hq, isLoading, error } = useQuery({
    queryKey: ['hq-dashboard'],
    queryFn: () => analyticsService.getHQDashboard(),
    refetchInterval: 30_000,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  console.log('[AdminDashboard] ADMIN STATS:', hq)

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Network-wide overview — live from PostgreSQL" />

      {error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Could not load dashboard data. Check the backend server is running.
        </div>
      ) : null}

      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: TrendingUp, label: 'Total Revenue', value: isLoading ? '...' : formatCurrency(hq?.totalRevenue ?? 0) },
          { icon: TrendingUp, label: 'This Month', value: isLoading ? '...' : formatCurrency(hq?.monthRevenue ?? 0) },
          { icon: ShoppingCart, label: 'Total Orders', value: isLoading ? '...' : String(hq?.totalOrders ?? 0) },
          { icon: ShoppingCart, label: 'Active Orders', value: isLoading ? '...' : String(hq?.activeOrders ?? 0) },
          { icon: CalendarDays, label: 'Upcoming Res.', value: isLoading ? '...' : String(hq?.upcomingReservations ?? 0) },
          { icon: Users, label: 'Total Staff', value: isLoading ? '...' : String(hq?.totalStaff ?? 0) },
          { icon: DollarSign, label: 'Monthly Salaries', value: isLoading ? '...' : formatCurrency(hq?.monthlySalaryBudget ?? 0) },
          { icon: Building2, label: 'Total Branches', value: isLoading ? '...' : String(hq?.branches?.length ?? 0) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-maroon" />
              <p className="text-xs text-gray-500">{label}</p>
            </div>
            <p className="text-xl font-serif font-bold text-maroon">{value}</p>
          </div>
        ))}
      </div>

      {/* Branch performance cards */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif font-bold text-maroon text-lg flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Branch Performance
        </h2>
        <Link to="/admin/branches" className="text-sm text-maroon hover:underline">Manage Branches</Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-100 rounded w-3/4 mb-4" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => <div key={j} className="h-3 bg-gray-100 rounded" />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(hq?.branches ?? []).map((branch: HQBranchStat) => (
            <div key={branch.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-maroon/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-serif font-bold text-maroon">{branch.name}</h3>
                  <p className="text-xs text-gray-400">{branch.location}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-beige rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Revenue</p>
                  <p className="font-bold text-maroon">{formatCurrency(branch.totalRevenue)}</p>
                </div>
                <div className="bg-beige rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Orders</p>
                  <p className="font-bold text-maroon">{branch.totalOrders.toLocaleString()}</p>
                </div>
                <div className="bg-beige rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Reservations</p>
                  <p className="font-bold text-maroon">{branch.upcomingReservations}</p>
                </div>
                <div className="bg-beige rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Staff</p>
                  <p className="font-bold text-maroon">{branch.staffCount}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span>Monthly Salaries</span>
                <span className="font-medium text-gray-700">{formatCurrency(branch.monthlySalaryBudget)}</span>
              </div>
            </div>
          ))}

          {(!hq?.branches || hq.branches.length === 0) && !isLoading && (
            <div className="col-span-3 text-center py-12 text-gray-400">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No branch data available</p>
            </div>
          )}
        </div>
      )}

      {/* Quick nav links */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'User Management', href: '/admin/users', icon: Users },
          { label: 'Branch Management', href: '/admin/branches', icon: Building2 },
          { label: 'Audit Logs', href: '/admin/audit-logs', icon: TrendingUp },
          { label: 'Role Management', href: '/admin/roles', icon: ShoppingCart },
        ].map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-maroon/20 hover:bg-beige transition-all text-sm font-medium text-gray-700 hover:text-maroon"
          >
            <Icon className="w-4 h-4 text-maroon" />
            {label}
          </Link>
        ))}
      </div>

      {hq && (
        <p className="text-xs text-gray-400 mt-6 text-center">
          Data from PostgreSQL · {new Date(hq.timestamp).toLocaleString('en-GB')}
        </p>
      )}
    </div>
  )
}
