import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

interface BranchRouteProps {
  children: React.ReactNode
}

/**
 * Enforces branch-level isolation for BRANCH_MANAGER and WAITER_CASHIER roles.
 * ADMIN and HQ_MANAGER bypass this check.
 * If the user has no branchId assigned they are redirected to 403.
 */
export function BranchRoute({ children }: BranchRouteProps) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) return null

  // ADMIN and HQ_MANAGER have cross-branch access — pass through
  if (user.role === 'ADMIN' || user.role === 'HQ_MANAGER') {
    return <>{children}</>
  }

  // BRANCH_MANAGER and WAITER_CASHIER must have a branchId assigned
  if ((user.role === 'BRANCH_MANAGER' || user.role === 'WAITER_CASHIER') && !user.branchId) {
    return (
      <Navigate
        to="/403"
        state={{ from: location.pathname, reason: 'No branch assigned to your account. Contact your administrator.' }}
        replace
      />
    )
  }

  return <>{children}</>
}
