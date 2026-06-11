import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { ROLE_DASHBOARD_ROUTES } from '@/constants/roles'

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()

  // Wait for bootstrap to finish before deciding
  if (isLoading) return null

  // Already logged in — redirect to their dashboard
  if (user) {
    return <Navigate to={ROLE_DASHBOARD_ROUTES[user.role]} replace />
  }

  return <>{children}</>
}
