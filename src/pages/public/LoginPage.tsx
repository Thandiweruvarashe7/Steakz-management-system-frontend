import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Info, MapPin, ChevronRight, UserPlus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import { useLogin } from '@/queries/auth.queries'
import { ROLE_DASHBOARD_ROUTES } from '@/constants/roles'
import { toast } from '@/components/ui/use-toast'
import type { Role } from '@/types'
import type { RecentCustomer } from '@/pages/public/RegisterPage'
import apiClient from '@/lib/axios'

// ── Branches ─────────────────────────────────────────────────────────
const BRANCHES = ['London', 'Manchester', 'Leeds', 'Birmingham', 'Liverpool'] as const
type Branch = (typeof BRANCHES)[number]

// ── Demo accounts ─────────────────────────────────────────────────────
interface DemoAccount {
  role: Role
  title: string
  email: string
  password: string
  branch?: Branch
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  // Global accounts
  { role: 'ADMIN',          title: 'Admin',              email: 'admin@steakz.co.uk',              password: 'Admin@123' },
  { role: 'HQ_MANAGER',     title: 'HQ Manager',         email: 'hq@steakz.co.uk',                 password: 'HQ@123' },
  // Branch managers
  { role: 'BRANCH_MANAGER', title: 'London Manager',     email: 'manager.london@steakz.co.uk',     password: 'Manager@123', branch: 'London' },
  { role: 'BRANCH_MANAGER', title: 'Manchester Manager', email: 'manager.manchester@steakz.co.uk', password: 'Manager@123', branch: 'Manchester' },
  { role: 'BRANCH_MANAGER', title: 'Leeds Manager',      email: 'manager.leeds@steakz.co.uk',      password: 'Manager@123', branch: 'Leeds' },
  { role: 'BRANCH_MANAGER', title: 'Birmingham Manager', email: 'manager.birmingham@steakz.co.uk', password: 'Manager@123', branch: 'Birmingham' },
  { role: 'BRANCH_MANAGER', title: 'Liverpool Manager',  email: 'manager.liverpool@steakz.co.uk',  password: 'Manager@123', branch: 'Liverpool' },
  // Waiters
  { role: 'WAITER_CASHIER',         title: 'London Waiter',      email: 'waiter.london@steakz.co.uk',      password: 'Waiter@123',  branch: 'London' },
  { role: 'WAITER_CASHIER',         title: 'Manchester Waiter',  email: 'waiter.manchester@steakz.co.uk',  password: 'Waiter@123',  branch: 'Manchester' },
  { role: 'WAITER_CASHIER',         title: 'Leeds Waiter',       email: 'waiter.leeds@steakz.co.uk',       password: 'Waiter@123',  branch: 'Leeds' },
  { role: 'WAITER_CASHIER',         title: 'Birmingham Waiter',  email: 'waiter.birmingham@steakz.co.uk',  password: 'Waiter@123',  branch: 'Birmingham' },
  { role: 'WAITER_CASHIER',         title: 'Liverpool Waiter',   email: 'waiter.liverpool@steakz.co.uk',   password: 'Waiter@123',  branch: 'Liverpool' },
  // Demo customer
  { role: 'CUSTOMER',       title: 'Demo Customer',      email: 'jane@steakz.co.uk',               password: 'Customer@123' },
]

// ── Styling maps ──────────────────────────────────────────────────────
const ROLE_STYLE: Record<Role, { border: string; badge: string; badgeDot: string; accent: string }> = {
  ADMIN:          { border: 'border-red-200',    badge: 'bg-red-100 text-red-800',       badgeDot: 'bg-red-500',    accent: 'text-red-700' },
  HQ_MANAGER:     { border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', badgeDot: 'bg-purple-500', accent: 'text-purple-700' },
  BRANCH_MANAGER: { border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-800',     badgeDot: 'bg-blue-500',   accent: 'text-blue-700' },
  WAITER_CASHIER: { border: 'border-green-200',  badge: 'bg-green-100 text-green-800',   badgeDot: 'bg-green-500',  accent: 'text-green-700' },
  CUSTOMER:       { border: 'border-gray-200',   badge: 'bg-gray-100 text-gray-700',     badgeDot: 'bg-gray-400',   accent: 'text-gray-600' },
}

const ROLE_BADGE_LABEL: Record<Role, string> = {
  ADMIN: 'Admin', HQ_MANAGER: 'HQ', BRANCH_MANAGER: 'Manager', WAITER_CASHIER: 'Waiter', CUSTOMER: 'Customer',
}

// ── Small clickable card ──────────────────────────────────────────────
function AccountCard({ account, selected, onSelect }: {
  account: DemoAccount
  selected: boolean
  onSelect: (a: DemoAccount) => void
}) {
  const s = ROLE_STYLE[account.role]
  return (
    <button
      type="button"
      onClick={() => onSelect(account)}
      className={`relative w-full text-left p-3.5 rounded-xl border-2 bg-white transition-all duration-150
        ${selected ? 'border-gold shadow-md shadow-gold/20 bg-beige' : `${s.border} hover:shadow-sm hover:-translate-y-0.5`}`}
    >
      {selected && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-gold" />}
      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mb-2 ${s.badge}`}>
        {ROLE_BADGE_LABEL[account.role]}
      </span>
      <p className={`font-semibold text-sm ${selected ? 'text-maroon' : 'text-gray-800'}`}>{account.title}</p>
      <p className="text-[10px] font-mono text-gray-400 mt-1 truncate">{account.email}</p>
    </button>
  )
}

// ── Large branch-staff card ───────────────────────────────────────────
function BranchStaffCard({ account, selected, onSelect }: {
  account: DemoAccount
  selected: boolean
  onSelect: (a: DemoAccount) => void
}) {
  const s = ROLE_STYLE[account.role]
  const isManager = account.role === 'BRANCH_MANAGER'
  return (
    <button
      type="button"
      onClick={() => onSelect(account)}
      className={`relative w-full text-left p-5 rounded-2xl border-2 bg-white transition-all duration-150 group
        ${selected ? 'border-gold shadow-lg shadow-gold/20 bg-beige' : `${s.border} hover:shadow-md hover:-translate-y-1`}`}
    >
      {selected && <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gold" />}

      {/* Top row */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${s.badgeDot}`} />
        <span className={`text-xs font-bold uppercase tracking-wide ${s.accent}`}>
          {isManager ? 'Branch Manager Login' : 'Waiter / Cashier Login'}
        </span>
      </div>

      {/* Title */}
      <p className={`font-serif font-bold text-lg leading-tight mb-0.5 ${selected ? 'text-maroon' : 'text-gray-800'}`}>
        {account.title}
      </p>

      {/* Description */}
      <p className="text-xs text-gray-400 mb-3">
        {isManager
          ? 'Access branch dashboard, inventory, staff, reservations & sales'
          : 'Access live orders, payments, receipts & floor plan'}
      </p>

      {/* Email + password row */}
      <div className="bg-gray-50 rounded-lg px-3 py-2 space-y-0.5">
        <div className="flex justify-between">
          <span className="text-[10px] text-gray-400">Email</span>
          <span className="text-[10px] font-mono text-gray-600">{account.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] text-gray-400">Password</span>
          <span className="text-[10px] font-mono text-gray-600">{account.password}</span>
        </div>
      </div>

      {!selected && (
        <p className={`text-xs font-medium mt-3 flex items-center gap-1 ${s.accent}`}>
          Click to auto-fill <ChevronRight className="w-3 h-3" />
        </p>
      )}
      {selected && (
        <p className="text-xs font-medium mt-3 text-gold flex items-center gap-1">
          ✓ Credentials loaded — press Sign In
        </p>
      )}
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────
export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([])
  const [loginError, setLoginError] = useState<string | null>(null)

  const { data: liveCustomers = [] } = useQuery({
    queryKey: ['login-page-customers'],
    queryFn: async () => {
      try {
        console.log('[LoginPage] Fetching customers from /users/public/customers')
        const response = await apiClient.get('/users/public/customers')
        const customers = response.data.users ?? []
        const filtered = customers.filter((u: { email: string }) => u.email !== 'jane@steakz.co.uk')
        console.log('[LoginPage] Public customers loaded:', filtered.length)

        // Sync localStorage — remove any deleted customers from the cache
        try {
          const liveEmails = new Set(filtered.map((u: any) => u.email))
          const stored = localStorage.getItem('steakz-recent-customers')
          if (stored) {
            const arr = JSON.parse(stored)
            const cleaned = arr.filter((c: any) => liveEmails.has(c.email))
            if (cleaned.length !== arr.length) {
              localStorage.setItem('steakz-recent-customers', JSON.stringify(cleaned))
              console.log('[LoginPage] Synced localStorage — removed', arr.length - cleaned.length, 'deleted customers')
            }
          }
        } catch {}

        return filtered
      } catch (err) {
        console.warn('[LoginPage] Could not load public customers:', err)
        return []
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || null

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Load recently registered customers from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('steakz-recent-customers')
      if (stored) {
        const customers: RecentCustomer[] = JSON.parse(stored)
        setRecentCustomers(customers)
        console.log('[LoginPage] Loaded', customers.length, 'recently registered customers for quick login')
      }
    } catch {
      console.warn('[LoginPage] Could not load recent customers from localStorage')
    }
  }, [])

  function selectAccount(account: DemoAccount) {
    console.log('[LoginPage] Quick login selected:', account.email, '| role:', account.role)
    setValue('email', account.email)
    setValue('password', account.password)
    setSelectedEmail(account.email)
    setLoginError(null)
    // Admin and HQ do not belong to a branch — clear branch selection
    if (account.role === 'ADMIN' || account.role === 'HQ_MANAGER') {
      console.log('[LoginPage] Global role selected — clearing branch selection')
      setSelectedBranch(null)
    }
  }

  function pickBranch(branch: Branch) {
    console.log('[LoginPage] Branch selected:', branch)
    setSelectedBranch(branch)
    setSelectedEmail(null)
    setLoginError(null)
    setValue('email', '')
    setValue('password', '')
  }

  async function onSubmit(data: LoginFormData) {
    setLoginError(null)
    const payload = { email: data.email, password: data.password, selectedBranch: selectedBranch ?? null }
    console.log('================================================')
    console.log('[LoginPage] LOGIN ATTEMPT')
    console.log('LOGIN PAYLOAD:', { ...payload, password: '[HIDDEN]' })
    console.log('[LoginPage] selectedBranch sent:', payload.selectedBranch ?? '(none — global role)')
    console.log('[LoginPage] AXIOS BASE URL:', import.meta.env.VITE_API_URL || '/api')
    try {
      const result = await login.mutateAsync(payload)
      console.log('[LoginPage] LOGIN SUCCESS')
      console.log('[LoginPage] LOGIN RAW RESPONSE USER:', { email: result.user.email, role: result.user.role, branchId: result.user.branchId ?? 'none (global role)' })
      console.log('[LoginPage] BRANCH CHECK RESULT — selectedBranch:', selectedBranch ?? 'none', '| userBranchId:', result.user.branchId ?? 'none (global role)', '→ ALLOWED')

      const destination = from || ROLE_DASHBOARD_ROUTES[result.user.role] || '/'
      console.log('[LoginPage] Role:', result.user.role, '→ Redirecting to:', destination)
      console.log('================================================')
      toast({ title: `Welcome back, ${result.user.firstName}!`, variant: 'success' })
      navigate(destination, { replace: true })
    } catch (err: unknown) {
      const errObj = err as { message?: string; code?: string; statusCode?: number; response?: { status?: number; data?: { message?: string } } }
      console.error('[LoginPage] LOGIN FAILED')
      console.error('[LoginPage] LOGIN ERROR:', err)
      console.error('[LoginPage] Error message:', errObj?.message)
      console.error('[LoginPage] Error statusCode:', errObj?.statusCode ?? errObj?.response?.status)
      console.log('[LoginPage] BRANCH CHECK RESULT — selectedBranch:', selectedBranch ?? 'none', '→ DENIED')
      console.log('================================================')

      const httpStatus = errObj?.statusCode ?? errObj?.response?.status
      const backendMsg = errObj?.response?.data?.message ?? errObj?.message ?? ''

      if (httpStatus === 403) {
        // Backend returns the exact denial message — show it inline
        setLoginError(backendMsg || 'Access denied. Your account is not assigned to this branch.')
      } else if (errObj?.code === 'NETWORK_ERROR') {
        setLoginError('Cannot connect to backend server. Please ensure the API is running on port 5000.')
      } else {
        setLoginError('Sign in failed. Please check your credentials.')
      }
    }
  }

  // Derived data
  const globalAccounts = DEMO_ACCOUNTS.filter((a) => !a.branch)
  const adminHQAccounts = globalAccounts.filter((a) => a.role === 'ADMIN' || a.role === 'HQ_MANAGER')
  const demoCustomerAccounts = globalAccounts.filter((a) => a.role === 'CUSTOMER')
  const branchManager = selectedBranch ? DEMO_ACCOUNTS.find((a) => a.role === 'BRANCH_MANAGER' && a.branch === selectedBranch) : null
  const branchWaiter  = selectedBranch ? DEMO_ACCOUNTS.find((a) => a.role === 'WAITER_CASHIER'   && a.branch === selectedBranch) : null

  return (
    <div className="min-h-screen bg-beige flex">

      {/* ── Left branding panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-72 xl:w-80 bg-luxury flex-col justify-between p-10 flex-shrink-0">
        <Link to="/" className="font-serif text-xl font-bold text-white tracking-widest">STEAKZ UK</Link>

        <div className="text-center">
          <div className="w-14 h-px bg-gold mx-auto mb-5" />
          <h2 className="font-serif text-3xl font-bold text-white leading-snug mb-3">Branch<br />Login</h2>
          <p className="text-white/50 text-xs leading-relaxed">
            Select your branch, then choose your role. Admin and HQ sign in without branch selection.
          </p>
          <div className="w-14 h-px bg-gold mx-auto mt-5" />
        </div>

        {/* Branch list */}
        <div className="space-y-1.5">
          <p className="text-white/30 uppercase tracking-widest text-[10px] mb-3">Branches</p>
          {BRANCHES.map((b) => (
            <div key={b} className={`flex items-center gap-2 text-xs py-1 px-2 rounded-lg transition-colors cursor-pointer ${selectedBranch === b ? 'bg-white/20 text-gold' : 'text-white/50 hover:text-white/80'}`}
              onClick={() => pickBranch(b)}>
              <MapPin className="w-3 h-3" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-10">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="font-serif text-3xl font-bold text-maroon">STEAKZ UK</Link>
          </div>

          {/* ── Sign In form ───────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-maroon mb-1">Sign In</h2>
            <p className="text-gray-400 text-xs mb-5">
              Select an account below — email and password will auto-fill. Then press Sign In.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon bg-white font-mono"
                    placeholder="auto-filled on card click"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-gray-600">Password</label>
                  </div>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-maroon bg-white font-mono"
                      placeholder="auto-filled on card click"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
              </div>

              {loginError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <span className="text-red-500 text-sm font-medium leading-snug">{loginError}</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none sm:w-44 bg-maroon text-white py-2.5 rounded-xl font-semibold hover:bg-maroon-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
                    : 'Sign In →'}
                </button>
                <p className="text-xs text-gray-400">
                  Guest?{' '}
                  <Link to="/register" className="text-maroon font-medium hover:underline">Register here</Link>
                </p>
              </div>
            </form>
          </div>

          {/* ── Administration ─────────────────────────────── */}
          <div className="mb-6">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Administration</p>
            <div className="grid grid-cols-2 gap-3">
              {adminHQAccounts.map((a) => (
                <AccountCard key={a.email} account={a} selected={selectedEmail === a.email} onSelect={selectAccount} />
              ))}
            </div>
          </div>

          {/* ── Branch Login ─────────────────────────── */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gray-200" />
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Branch Login
              </p>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Branch selector */}
            <p className="text-xs text-gray-500 mb-3 text-center">Select your branch first</p>
            <div className="flex flex-wrap gap-2 justify-center mb-5">
              {BRANCHES.map((branch) => (
                <button
                  key={branch}
                  type="button"
                  onClick={() => pickBranch(branch)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-150 flex items-center gap-1.5
                    ${selectedBranch === branch
                      ? 'bg-maroon text-white border-maroon shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-maroon hover:text-maroon'
                    }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {branch}
                </button>
              ))}
            </div>

            {/* Branch staff cards — shown only after branch is selected */}
            {selectedBranch ? (
              <div>
                <p className="text-sm font-semibold text-maroon text-center mb-4">
                  {selectedBranch} — Choose Your Role
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {branchManager && (
                    <BranchStaffCard
                      account={branchManager}
                      selected={selectedEmail === branchManager.email}
                      onSelect={selectAccount}
                    />
                  )}
                  {branchWaiter && (
                    <BranchStaffCard
                      account={branchWaiter}
                      selected={selectedEmail === branchWaiter.email}
                      onSelect={selectAccount}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl py-10 text-center text-gray-400 text-sm">
                <MapPin className="w-6 h-6 mx-auto mb-2 opacity-40" />
                Select a branch above to see staff login options
              </div>
            )}
          </div>

          {/* ── Customers ──────────────────────────────────── */}
          <div className="mb-6">
            {(() => {
              // liveCustomers already has jane filtered out (done in queryFn)
              const displayCustomers = liveCustomers.length > 0 ? liveCustomers : recentCustomers
              const usingLive = liveCustomers.length > 0
              const count = usingLive ? liveCustomers.length : recentCustomers.length
              return (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Customers</p>
                    {count > 0 && (
                      <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                        <UserPlus className="w-3 h-3" />
                        {usingLive ? `${count} registered` : `${count} recently registered`}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Demo customer */}
                    {demoCustomerAccounts.map((a) => (
                      <AccountCard key={a.email} account={a} selected={selectedEmail === a.email} onSelect={selectAccount} />
                    ))}
                    {/* Live API customers or localStorage fallback — max 4 */}
                    {displayCustomers.slice(0, 4).map((c: RecentCustomer & { id?: string; role?: string }) => {
                      const hasPassword = 'password' in c
                      return (
                        <button
                          type="button"
                          key={c.email}
                          onClick={() => {
                            setValue('email', c.email)
                            if (hasPassword) setValue('password', (c as RecentCustomer).password)
                            setSelectedEmail(c.email)
                            console.log('[LoginPage] Customer quick login selected:', c.email, '| autofill password:', hasPassword)
                          }}
                          className={`relative w-full text-left p-3.5 rounded-xl border-2 bg-white transition-all duration-150
                            ${selectedEmail === c.email ? 'border-gold shadow-md shadow-gold/20 bg-beige' : 'border-emerald-200 hover:shadow-sm hover:-translate-y-0.5'}`}
                        >
                          {selectedEmail === c.email && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-gold" />}
                          <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mb-2 bg-emerald-100 text-emerald-800">
                            {hasPassword ? 'New Customer' : 'Customer'}
                          </span>
                          <p className={`font-semibold text-sm ${selectedEmail === c.email ? 'text-maroon' : 'text-gray-800'}`}>
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="text-[10px] font-mono text-gray-400 mt-1 truncate">{c.email}</p>
                        </button>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </div>

          {/* Staff notice */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              <strong>Staff accounts</strong> are created by the Administrator or HQ Manager.
              Waiters and Branch Managers cannot self-register.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
