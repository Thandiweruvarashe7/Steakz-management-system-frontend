import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from '@/components/navigation/DashboardSidebar'
import { DashboardHeader } from '@/components/navigation/DashboardHeader'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ADMIN_NAV } from '@/constants/nav'

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar navItems={ADMIN_NAV} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
