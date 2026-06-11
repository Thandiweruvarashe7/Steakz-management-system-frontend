import { Shield } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { ROLE_LABELS, ROLE_COLORS } from '@/constants/roles'
import type { Role } from '@/types'

const ROLES: Role[] = ['ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER', 'WAITER_CASHIER', 'CUSTOMER']

const PERMISSIONS = [
  { resource: 'User Management', ADMIN: true, HQ_MANAGER: false, BRANCH_MANAGER: false, WAITER_CASHIER: false, CUSTOMER: false },
  { resource: 'Branch Management', ADMIN: true, HQ_MANAGER: true, BRANCH_MANAGER: false, WAITER_CASHIER: false, CUSTOMER: false },
  { resource: 'All Branch Analytics', ADMIN: true, HQ_MANAGER: true, BRANCH_MANAGER: false, WAITER_CASHIER: false, CUSTOMER: false },
  { resource: 'Own Branch Analytics', ADMIN: true, HQ_MANAGER: true, BRANCH_MANAGER: true, WAITER_CASHIER: false, CUSTOMER: false },
  { resource: 'Inventory Management', ADMIN: true, HQ_MANAGER: true, BRANCH_MANAGER: true, WAITER_CASHIER: false, CUSTOMER: false },
  { resource: 'Reservations (all)', ADMIN: true, HQ_MANAGER: true, BRANCH_MANAGER: true, WAITER_CASHIER: false, CUSTOMER: false },
  { resource: 'Reservations (own)', ADMIN: true, HQ_MANAGER: true, BRANCH_MANAGER: true, WAITER_CASHIER: true, CUSTOMER: true },
  { resource: 'Live Orders', ADMIN: true, HQ_MANAGER: true, BRANCH_MANAGER: true, WAITER_CASHIER: true, CUSTOMER: false },
  { resource: 'Payments', ADMIN: true, HQ_MANAGER: true, BRANCH_MANAGER: true, WAITER_CASHIER: true, CUSTOMER: false },
  { resource: 'Floor Plan (edit)', ADMIN: true, HQ_MANAGER: false, BRANCH_MANAGER: true, WAITER_CASHIER: false, CUSTOMER: false },
  { resource: 'Floor Plan (view)', ADMIN: true, HQ_MANAGER: true, BRANCH_MANAGER: true, WAITER_CASHIER: true, CUSTOMER: false },
  { resource: 'Payroll', ADMIN: true, HQ_MANAGER: true, BRANCH_MANAGER: false, WAITER_CASHIER: false, CUSTOMER: false },
  { resource: 'Marketing', ADMIN: true, HQ_MANAGER: true, BRANCH_MANAGER: false, WAITER_CASHIER: false, CUSTOMER: false },
  { resource: 'Audit Logs', ADMIN: true, HQ_MANAGER: false, BRANCH_MANAGER: false, WAITER_CASHIER: false, CUSTOMER: false },
  { resource: 'Own Profile', ADMIN: true, HQ_MANAGER: true, BRANCH_MANAGER: true, WAITER_CASHIER: true, CUSTOMER: true },
]

export function RoleManagementPage() {
  return (
    <div>
      <PageHeader title="Role Management" subtitle="Permission matrix across all roles" />

      {/* Role hierarchy */}
      <div className="flex flex-wrap gap-4 mb-8">
        {[...ROLES].reverse().map((role, i) => (
          <div key={role} className="flex items-center gap-3">
            <div className={`relative flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm ${ROLE_COLORS[role]}`}>
              {5 - i}
              <Shield className="absolute -bottom-1 -right-1 w-4 h-4 text-maroon" />
            </div>
            <div>
              <p className="font-medium text-maroon text-sm">{ROLE_LABELS[role]}</p>
              <p className="text-xs text-gray-400">Level {5 - i}</p>
            </div>
            {i < ROLES.length - 1 && <div className="h-px w-6 bg-gray-300 ml-2" />}
          </div>
        ))}
      </div>

      {/* Permission matrix */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-beige">
            <tr>
              <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide w-48">Resource</th>
              {ROLES.map((role) => (
                <th key={role} className="text-center px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>{ROLE_LABELS[role]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {PERMISSIONS.map((perm) => (
              <tr key={perm.resource} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-700">{perm.resource}</td>
                {ROLES.map((role) => (
                  <td key={role} className="px-4 py-3 text-center">
                    {perm[role as keyof typeof perm] ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs">✓</span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs">✕</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
