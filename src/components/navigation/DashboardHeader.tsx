import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bell, Menu, Home } from 'lucide-react'
import { useUIStore } from '@/stores/ui.store'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/lib/utils'
import { NotificationsPanel } from '@/components/ui/NotificationsPanel'
import { ROLE_DASHBOARD_ROUTES } from '@/constants/roles'
import apiClient from '@/lib/axios'

function getBreadcrumb(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return 'Dashboard'
  const last = segments[segments.length - 1]
  return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function DashboardHeader() {
  const { pathname } = useLocation()
  const { toggleSidebar } = useUIStore()
  const { user } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)

  // Bug 8: fetch unread count every 60s for live bell badge
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      console.log('[DashboardHeader] Fetching GET /notifications for unread count')
      const resp = await apiClient.get<{ success: boolean; notifications: unknown[]; unreadCount: number }>('/notifications')
      console.log('[DashboardHeader] Notifications unreadCount:', resp.data.unreadCount)
      return resp.data
    },
    refetchInterval: 60_000,
    refetchOnMount: true,
  })
  const unreadCount = notifData?.unreadCount ?? 0

  // Profile link goes to the role-appropriate dashboard for non-customers
  const profileHref = user?.role === 'CUSTOMER' ? '/customer/profile' : (ROLE_DASHBOARD_ROUTES[user?.role ?? 'CUSTOMER'] ?? '/')

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-beige transition-colors"
          >
            <Menu className="w-5 h-5 text-maroon" />
          </button>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              {pathname.split('/')[1]?.toUpperCase()}
            </p>
            <h2 className="text-base font-semibold text-maroon">{getBreadcrumb(pathname)}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Back to Home — visible for all dashboard users */}
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-maroon px-3 py-1.5 rounded-lg hover:bg-beige transition-colors"
            title="Back to public site"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {/* Notifications bell */}
          <button
            onClick={() => {
              console.log('[DashboardHeader] Bell clicked — toggling notifications panel')
              setNotifOpen((v) => !v)
            }}
            className="relative p-2 rounded-lg hover:bg-beige transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {user && (
            <Link to={profileHref} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-maroon flex items-center justify-center text-white text-xs font-bold">
                {getInitials(user.firstName, user.lastName)}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.firstName}</span>
            </Link>
          )}
        </div>
      </header>

      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  )
}
