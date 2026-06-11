import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Search, AlertCircle, Trash2, Plus, X } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SkeletonList } from '@/components/ui/SkeletonCard'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { toast } from '@/components/ui/use-toast'
import { staffService, type StaffMember } from '@/services/staff.service'
import { useAuth } from '@/hooks/useAuth'
import apiClient from '@/lib/axios'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin', HQ_MANAGER: 'HQ Manager', BRANCH_MANAGER: 'Branch Manager',
  WAITER_CASHIER: 'Waiter/Cashier', CHEF: 'Chef', KITCHEN_ASSISTANT: 'Kitchen Assistant', CUSTOMER: 'Customer',
}
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-800', HQ_MANAGER: 'bg-purple-100 text-purple-800',
  BRANCH_MANAGER: 'bg-blue-100 text-blue-800', WAITER_CASHIER: 'bg-green-100 text-green-800',
  CHEF: 'bg-orange-100 text-orange-800', KITCHEN_ASSISTANT: 'bg-yellow-100 text-yellow-800',
  CUSTOMER: 'bg-gray-100 text-gray-700',
}
const STAFF_ROLES = ['ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER', 'WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT']
const BRANCH_ROLES = ['BRANCH_MANAGER', 'WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT']

export function UserManagementPage() {
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const qc = useQueryClient()

  // Create form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('WAITER_CASHIER')
  const [branchId, setBranchId] = useState('')

  const { data: liveBranches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await apiClient.get('/branches')
      console.log('[UserManagement] Branches from DB:', response.data)
      return response.data.branches ?? response.data ?? []
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  })

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      console.log('[UserManagement] Fetching users from GET /users')
      return staffService.getStaff()
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      console.log('[UserManagement] DELETE user:', id)
      return staffService.deleteStaff(id)
    },
    onMutate: async (id) => {
      // Optimistic update — remove from list immediately
      await qc.cancelQueries({ queryKey: ['users'] })
      const previous = qc.getQueryData<StaffMember[]>(['users'])
      qc.setQueryData<StaffMember[]>(['users'], (old) => (old ?? []).filter((u) => u.id !== id))
      return { previous }
    },
    onSuccess: (data: any) => {
      const deletedEmail = data?.deletedEmail

      if (deletedEmail) {
        try {
          const stored = localStorage.getItem('steakz-recent-customers')
          if (stored) {
            const arr = JSON.parse(stored)
            const cleaned = arr.filter((c: any) => c.email !== deletedEmail)
            localStorage.setItem('steakz-recent-customers', JSON.stringify(cleaned))
            console.log('[UserMgmt] Removed', deletedEmail, 'from localStorage')
          }
        } catch {}
      }

      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['staff'] })
      qc.invalidateQueries({ queryKey: ['login-page-customers'] })
      toast({ title: 'User deleted successfully', variant: 'success' })
      setDeleteId(null)
    },
    onError: (err: any, _, context) => {
      const msg = err?.message ?? err?.response?.data?.message ?? 'Could not delete user'
      console.error('[UserMgmt] Delete failed:', msg, err)
      if (context?.previous) qc.setQueryData(['users'], context.previous)
      toast({ title: 'Could not delete user', description: msg, variant: 'destructive' })
      setDeleteId(null)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  const createMutation = useMutation({
    mutationFn: () => {
      console.log('[UserManagement] POST /users — email:', email, '| role:', role, '| branchId:', branchId || 'none')
      return staffService.createStaff({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
        branchId: BRANCH_ROLES.includes(role) ? branchId || undefined : undefined,
      })
    },
    onSuccess: (newUser) => {
      console.log('[AUDIT] USER_CREATED admin:', currentUser?.id, '| new user:', newUser.id, '| role:', newUser.role)
      qc.invalidateQueries({ queryKey: ['users'] })
      toast({ title: 'User created successfully', description: `${newUser.firstName} ${newUser.lastName} (${ROLE_LABELS[newUser.role] ?? newUser.role})`, variant: 'success' })
      setShowCreate(false)
      setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setRole('WAITER_CASHIER'); setBranchId('')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as { message?: string })?.message ?? 'Server error'
      console.error('[UserManagement] Create failed:', msg)
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) {
        toast({ title: 'Email already in use', description: 'A user with this email already exists.', variant: 'destructive' })
      } else {
        toast({ title: 'Could not create user', description: msg, variant: 'destructive' })
      }
    },
  })

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      toast({ title: 'All fields are required', variant: 'destructive' }); return
    }
    if (BRANCH_ROLES.includes(role) && !branchId) {
      toast({ title: 'Please select a branch for this role', variant: 'destructive' }); return
    }
    createMutation.mutate()
  }

  const needsBranch = BRANCH_ROLES.includes(role)

  const filtered = users.filter((u: StaffMember) => {
    const q = search.toLowerCase()
    return (`${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (roleFilter === 'all' || u.role === roleFilter)
  })

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="All users loaded live from PostgreSQL"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-maroon text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors"
          >
            <Plus className="w-4 h-4" /> Create User
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon">
          <option value="all">All Roles</option>
          {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {isLoading ? <SkeletonList items={8} /> : error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Could not load users. Ensure the backend server is running and the database is seeded.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">User</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Branch</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u: StaffMember) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5"><p className="font-medium text-gray-800">{u.firstName} {u.lastName}</p><p className="text-xs text-gray-400">{u.email}</p></td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>{ROLE_LABELS[u.role] ?? u.role}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-sm">{u.branch?.name ?? (u.branchId ? u.branchId : '—')}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.employeeStatus === 'TERMINATED' ? 'bg-red-100 text-red-700' : u.employeeStatus === 'ON_LEAVE' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {u.employeeStatus ?? 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button onClick={() => setDeleteId(u.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete user"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400"><Users className="w-8 h-8 mx-auto mb-2 opacity-30" />No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 text-center">{filtered.length} of {users.length} users · Live from PostgreSQL</p>

      {/* Create User modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif font-bold text-maroon text-lg">Create New User</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@steakz.co.uk"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" required minLength={8} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon">
                  {STAFF_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>)}
                </select>
              </div>
              {needsBranch && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Branch</label>
                  <select value={branchId} onChange={(e) => setBranchId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" required>
                    <option value="">Select branch…</option>
                    {liveBranches.map((b: { id: string; name: string; city?: string }) => (
                      <option key={b.id} value={b.id}>{b.name}{b.city ? ` — ${b.city}` : ''}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 bg-maroon text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-maroon-dark transition-colors disabled:opacity-60">
                  {createMutation.isPending ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Delete User"
        description="This will permanently delete the user account. This action cannot be undone." confirmLabel="Delete" variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />
    </div>
  )
}
