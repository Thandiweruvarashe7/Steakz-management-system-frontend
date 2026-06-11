import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useState } from 'react'
import { registerSchema, type RegisterFormData } from '@/lib/validators'
import { useRegister } from '@/queries/auth.queries'
import { toast } from '@/components/ui/use-toast'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'

// Key used to store recently registered customers for the quick login panel
const RECENT_CUSTOMERS_KEY = 'steakz-recent-customers'

export interface RecentCustomer {
  firstName: string
  lastName: string
  email: string
  password: string
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length
  const colors = ['bg-red-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500']

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="flex gap-4">
        {checks.map((c) => (
          <span key={c.label} className={`flex items-center gap-1 text-xs ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>
            <Check className="w-3 h-3" /> {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const register_ = useRegister()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')

  async function onSubmit(data: RegisterFormData) {
    console.log('[Register] Submitting registration for:', data.email)
    try {
      const result = await register_.mutateAsync(data)
      console.log('[Register] Registration successful:', result.user.email)

      // Store this customer in localStorage so they appear in the quick login list
      const newCustomer: RecentCustomer = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      }
      try {
        const existing: RecentCustomer[] = JSON.parse(localStorage.getItem(RECENT_CUSTOMERS_KEY) || '[]')
        // Prepend new customer, remove duplicates by email, keep max 5
        const updated = [
          newCustomer,
          ...existing.filter((c) => c.email !== data.email),
        ].slice(0, 5)
        localStorage.setItem(RECENT_CUSTOMERS_KEY, JSON.stringify(updated))
        console.log('[Register] Quick login list updated — stored', updated.length, 'customers')
      } catch (storageErr) {
        console.warn('[Register] Could not update quick login list:', storageErr)
      }

      // Auto-login after successful registration
      try {
        console.log('[Register] Auto-login attempt for:', data.email)
        const loginResult = await authService.login({ email: data.email, password: data.password })
        useAuthStore.getState().setAuth(loginResult.user, loginResult.accessToken)
        console.log('[Register] Auto-login success — redirecting to /customer')
        toast({ title: 'Welcome to STEAKZ!', description: 'Your account is ready. Enjoy your dining experience!', variant: 'success' })
        navigate('/customer')
      } catch (loginErr) {
        console.warn('[Register] Auto-login failed — redirecting to login page:', loginErr)
        toast({ title: 'Account created!', description: 'Please sign in with your new credentials.', variant: 'success' })
        navigate('/login')
      }
    } catch (err: unknown) {
      console.error('[Register] Registration failed:', err)
      const msg = (err as { message?: string })?.message || 'Registration failed'
      toast({ title: 'Registration failed', description: msg, variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-beige flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-3xl font-bold text-maroon">STEAKZ UK</Link>
          <h2 className="font-serif text-2xl font-bold text-maroon mt-4 mb-1">Create your account</h2>
          <p className="text-gray-500 text-sm">For guests only — staff accounts are created by administrators</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input {...register('firstName')} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" placeholder="John" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input {...register('lastName')} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" placeholder="Smith" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input {...register('email')} type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" placeholder="john@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
              <input {...register('phone')} type="tel" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" placeholder="+44 7700 000000" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                  placeholder="Create a strong password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && <PasswordStrength password={password} />}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input {...register('confirmPassword')} type="password" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" placeholder="Repeat your password" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-maroon-dark transition-colors disabled:opacity-60">
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-maroon font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
