import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { ROLE_DASHBOARD_ROUTES } from '@/constants/roles'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Role } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: Role[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, accessToken } = useAuthStore()
  const location = useLocation()

  // Show loader while restoring session from cookie
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-beige gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-400 animate-pulse">Restoring session…</p>
      </div>
    )
  }

  // Not authenticated — send to login, remember intended destination
  if (!user || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Authenticated but wrong role — redirect to 403
  if (!allowedRoles.includes(user.role)) {
    // ADMIN can access everything — bounce to their own dashboard instead of 403
    if (user.role === 'ADMIN') {
      return <Navigate to={ROLE_DASHBOARD_ROUTES['ADMIN']} replace />
    }
    return (
      <Navigate
        to="/403"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  return <>{children}</>
}
