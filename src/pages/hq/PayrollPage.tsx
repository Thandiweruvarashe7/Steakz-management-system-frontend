import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, Users, AlertCircle, X } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SkeletonList } from '@/components/ui/SkeletonCard'
import { formatCurrency } from '@/lib/utils'
import { staffService, type StaffMember } from '@/services/staff.service'

const ROLE_LABELS: Record<string, string> = {
  BRANCH_MANAGER: 'Branch Manager',
  WAITER_CASHIER: 'Waiter/Cashier',
  CHEF: 'Chef',
  KITCHEN_ASSISTANT: 'Kitchen Assistant',
  HQ_MANAGER: 'HQ Manager',
  ADMIN: 'Admin',
}

const SHIFT_LABELS: Record<string, string> = {
  MORNING: 'Morning', AFTERNOON: 'Afternoon', EVENING: 'Evening', NIGHT: 'Night', FLEXIBLE: 'Flexible',
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ON_LEAVE: 'bg-amber-100 text-amber-700',
  TERMINATED: 'bg-red-100 text-red-700',
}

export function PayrollPage() {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)

  const { data: staff = [], isLoading, error } = useQuery({
    queryKey: ['staff', 'all'],
    queryFn: () => staffService.getStaff(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  })

  const employees = staff.filter((s) => s.role !== 'CUSTOMER')
  const totalSalary = employees.reduce((sum, s) => sum + (Number(s.salary) || 0), 0)
  const totalMonthly = totalSalary / 12
  const activeCount = employees.filter((s) => (s.employeeStatus ?? 'ACTIVE') === 'ACTIVE').length

  console.log('[PayrollPage] Loaded', employees.length, 'employees from backend')

  return (
    <div>
      <PageHeader title="Payroll" subtitle="Employee salary information — live from PostgreSQL" />

      {error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Could not load staff data. Check the backend server is running.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-beige flex items-center justify-center"><Users className="w-6 h-6 text-maroon" /></div>
          <div>
            <p className="text-2xl font-serif font-bold text-maroon">{isLoading ? '...' : activeCount}</p>
            <p className="text-xs text-gray-500">Active Employees</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-beige flex items-center justify-center"><DollarSign className="w-6 h-6 text-maroon" /></div>
          <div>
            <p className="text-2xl font-serif font-bold text-maroon">{isLoading ? '...' : formatCurrency(totalMonthly)}</p>
            <p className="text-xs text-gray-500">Monthly Salary Budget</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-beige flex items-center justify-center"><DollarSign className="w-6 h-6 text-maroon" /></div>
          <div>
            <p className="text-2xl font-serif font-bold text-maroon">{isLoading ? '...' : formatCurrency(totalSalary)}</p>
            <p className="text-xs text-gray-500">Annual Salary Budget</p>
          </div>
        </div>
      </div>

      {isLoading ? <SkeletonList items={6} /> : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-beige">
              <tr>
                {['Employee', 'Branch', 'Role', 'Shift', 'Annual Salary', 'Monthly', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((emp) => {
                const salary = Number(emp.salary) || 0
                const monthly = salary / 12
                const status = emp.employeeStatus ?? 'ACTIVE'
                return (
                  <tr key={emp.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedStaff(emp)}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-gray-400">{emp.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{emp.branch?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{ROLE_LABELS[emp.role] ?? emp.role}</td>
                    <td className="px-4 py-3 text-gray-500">{emp.shift ? (SHIFT_LABELS[emp.shift] ?? emp.shift) : '—'}</td>
                    <td className="px-4 py-3 font-medium text-maroon">{salary > 0 ? formatCurrency(salary) : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{monthly > 0 ? formatCurrency(monthly) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {employees.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No employee records found.</td></tr>
              )}
            </tbody>
            {employees.length > 0 && (
              <tfoot className="border-t-2 border-gray-200 bg-beige">
                <tr>
                  <td colSpan={4} className="px-4 py-3 font-bold text-maroon text-right">Annual Total:</td>
                  <td className="px-4 py-3 font-bold text-maroon">{formatCurrency(totalSalary)}</td>
                  <td className="px-4 py-3 font-bold text-maroon">{formatCurrency(totalMonthly)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4 text-center">{employees.length} employees — Live from PostgreSQL · Click a row for details</p>

      {selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedStaff(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-full bg-maroon flex items-center justify-center text-white text-xl font-bold font-serif">
                {selectedStaff.firstName[0]}{selectedStaff.lastName[0]}
              </div>
              <button onClick={() => setSelectedStaff(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <h3 className="font-serif font-bold text-maroon text-xl mb-1">{selectedStaff.firstName} {selectedStaff.lastName}</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedStaff.email}</p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {([
                ['Role', ROLE_LABELS[selectedStaff.role] ?? selectedStaff.role],
                ['Branch', selectedStaff.branch?.name ?? '—'],
                ['Employee ID', selectedStaff.employeeId ?? '—'],
                ['Shift', selectedStaff.shift ? (SHIFT_LABELS[selectedStaff.shift] ?? selectedStaff.shift) : '—'],
                ['Annual Salary', selectedStaff.salary ? formatCurrency(Number(selectedStaff.salary)) : '—'],
                ['Monthly Pay', selectedStaff.salary ? formatCurrency(Number(selectedStaff.salary) / 12) : '—'],
                ['Status', selectedStaff.employeeStatus ?? 'ACTIVE'],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</dt>
                  <dd className="font-medium text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}
