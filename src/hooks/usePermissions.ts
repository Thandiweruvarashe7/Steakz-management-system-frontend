import { useAuthStore } from '@/stores/auth.store'
import type { Role } from '@/types'

const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 5,
  HQ_MANAGER: 4,
  BRANCH_MANAGER: 3,
  WAITER_CASHIER: 2,
  CUSTOMER: 1,
}

export function usePermissions() {
  const user = useAuthStore((state) => state.user)
  const role = user?.role ?? null

  function hasPermission(requiredRole: Role): boolean {
    if (!role) return false
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[requiredRole]
  }

  function canAccess(allowedRoles: Role[]): boolean {
    if (!role) return false
    return allowedRoles.includes(role)
  }

  function isSameBranch(branchId: string): boolean {
    if (!user) return false
    if (user.role === 'ADMIN' || user.role === 'HQ_MANAGER') return true
    return user.branchId === branchId
  }

  return { role, hasPermission, canAccess, isSameBranch }
}
