import { useAuthStore } from '@/stores/auth.store'
import { ROLE_DASHBOARD_ROUTES } from '@/constants/roles'
import type { Role } from '@/types'

export function useAuth() {
  const { user, accessToken, isLoading, setAuth, clearAuth, setLoading } = useAuthStore()

  const isAuthenticated = !!user && !!accessToken
  const role = user?.role ?? null
  const canPlaceOrders = role === 'CUSTOMER' || role === 'WAITER_CASHIER'

  function getDashboardRoute(r: Role): string {
    return ROLE_DASHBOARD_ROUTES[r]
  }

  function hasRole(requiredRole: Role): boolean {
    if (!role) return false
    const hierarchy: Record<Role, number> = { ADMIN: 5, HQ_MANAGER: 4, BRANCH_MANAGER: 3, WAITER_CASHIER: 2, CUSTOMER: 1 }
    return hierarchy[role] >= hierarchy[requiredRole]
  }

  function canAccess(allowedRoles: Role[]): boolean {
    if (!role) return false
    return allowedRoles.includes(role)
  }

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    canPlaceOrders,
    setAuth,
    clearAuth,
    setLoading,
    getDashboardRoute,
    hasRole,
    canAccess,
  }
}
