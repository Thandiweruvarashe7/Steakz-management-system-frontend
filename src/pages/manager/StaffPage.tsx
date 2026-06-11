import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, AlertCircle, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SkeletonList } from '@/components/ui/SkeletonCard'
import { staffService, type StaffMember } from '@/services/staff.service'
import { formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import apiClient from '@/lib/axios'

const SHIFT_LABELS: Record<string, string> = { MORNING: 'Morning', AFTERNOON: 'Afternoon', EVENING: 'Evening', NIGHT: 'Night', FLEXIBLE: 'Flexible' }
const ROLE_LABELS: Record<string, string> = { BRANCH_MANAGER: 'Branch Manager', WAITER_CASHIER: 'Waiter/Cashier', CHEF: 'Chef', KITCHEN_ASSISTANT: 'Kitchen Assistant', CUSTOMER: 'Customer', HQ_MANAGER: 'HQ Manager', ADMIN: 'Admin' }
const STATUS_COLORS: Record<string, string> = { ACTIVE: 'bg-green-100 text-green-700', ON_LEAVE: 'bg-amber-100 text-amber-700', TERMINATED: 'bg-red-100 text-red-700' }

export function StaffPage() {
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: staff = [], isLoading, error } = useQuery({
    queryKey: ['staff'],
    queryFn: () => {
      console.log('[StaffPage] Fetching staff from backend')
      return staffService.getStaff()
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      console.log('[StaffPage] PATCH /users/:id/status —', id, '→', status)
      const response = await apiClient.patch(`/users/${id}/status`, { employeeStatus: status })
      return response.data
    },
    onSuccess: (_, { status }) => {
      console.log('[StaffPage] Status updated →', status)
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast({ title: 'Staff status updated', variant: 'success' })
    },
    onError: (err: any) => {
      const msg = err?.message ?? err?.response?.data?.message ?? 'Could not update status'
      console.error('[StaffPage] Status update failed:', msg, err)
      toast({ title: 'Could not update status', description: msg, variant: 'destructive' })
    },
  })

  const filtered = staff.filter((s: StaffMember) => {
    const q = search.toLowerCase()
    return `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.employeeId ?? '').toLowerCase().includes(q)
  })

  return (
    <div>
      <PageHeader title="Staff" subtitle="Branch employee records from the database" />

      <div className="mb-5 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or employee ID…"
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
      </div>

      {isLoading ? <SkeletonList items={5} /> : error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Could not load staff. Check that the backend server is running.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Employee</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">ID</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Shift</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Salary</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((s: StaffMember) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5"><p className="font-medium text-gray-800">{s.firstName} {s.lastName}</p><p className="text-xs text-gray-400">{s.email}</p></td>
                  <td className="px-5 py-3.5 text-gray-600">{ROLE_LABELS[s.role] ?? s.role}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{s.employeeId ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{s.shift ? SHIFT_LABELS[s.shift] ?? s.shift : '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{s.salary ? `£${Number(s.salary).toLocaleString()}` : '—'}</td>
                  <td className="px-5 py-3.5 text-center">
                    <select
                      value={s.employeeStatus ?? 'ACTIVE'}
                      onChange={e => updateStatusMutation.mutate({ id: s.id, status: e.target.value })}
                      disabled={updateStatusMutation.isPending}
                      className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-maroon ${STATUS_COLORS[s.employeeStatus ?? 'ACTIVE'] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ON_LEAVE">ON_LEAVE</option>
                      <option value="TERMINATED">TERMINATED</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{s.dateJoined ? formatDate(s.dateJoined) : '—'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400"><Users className="w-8 h-8 mx-auto mb-2 opacity-30" />No staff found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4 text-center">{filtered.length} of {staff.length} staff members · Live from PostgreSQL</p>
    </div>
  )
}
