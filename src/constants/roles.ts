import type { Role } from '@/types'

export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN:          5,
  HQ_MANAGER:     4,
  BRANCH_MANAGER: 3,
  WAITER_CASHIER: 2,
  CUSTOMER:       1,
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN:          'Administrator',
  HQ_MANAGER:     'HQ Manager',
  BRANCH_MANAGER: 'Branch Manager',
  WAITER_CASHIER: 'Waiter / Cashier',
  CUSTOMER:       'Customer',
}

// These must match the route paths in router/index.tsx
export const ROLE_DASHBOARD_ROUTES: Record<Role, string> = {
  ADMIN:          '/admin',
  HQ_MANAGER:     '/hq',
  BRANCH_MANAGER: '/branch-manager',
  WAITER_CASHIER: '/waiter',
  CUSTOMER:       '/customer',
}

export const ROLE_COLORS: Record<Role, string> = {
  ADMIN:          'bg-red-100 text-red-800',
  HQ_MANAGER:     'bg-purple-100 text-purple-800',
  BRANCH_MANAGER: 'bg-blue-100 text-blue-800',
  WAITER_CASHIER: 'bg-green-100 text-green-800',
  CUSTOMER:       'bg-gray-100 text-gray-800',
}
