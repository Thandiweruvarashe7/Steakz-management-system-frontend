import { Link } from 'react-router-dom'
import { Lock, UserPlus, LogIn } from 'lucide-react'

interface AuthGateProps {
  title: string
  description: string
  from?: string
  compact?: boolean
}

export function AuthGate({ title, description, from, compact = false }: AuthGateProps) {
  const loginTo = from ? { pathname: '/login', search: `?from=${encodeURIComponent(from)}` } : '/login'

  if (compact) {
    return (
      <div className="bg-beige border-2 border-dashed border-maroon/20 rounded-2xl p-8 text-center">
        <Lock className="w-8 h-8 text-maroon/30 mx-auto mb-3" />
        <h3 className="font-serif font-bold text-maroon text-lg mb-1">{title}</h3>
        <p className="text-gray-500 text-sm mb-5 max-w-xs mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={loginTo}
            state={{ from }}
            className="flex items-center justify-center gap-2 bg-maroon text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-maroon-dark transition-colors"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </Link>
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 border-2 border-maroon text-maroon px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-beige transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Register Free
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-maroon/40" />
        </div>
        <div className="w-12 h-px bg-gold mx-auto mb-5" />
        <h2 className="font-serif font-bold text-2xl text-maroon mb-3">{title}</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={loginTo}
            state={{ from }}
            className="flex items-center justify-center gap-2 bg-maroon text-white px-6 py-3 rounded-xl font-semibold hover:bg-maroon-dark transition-colors"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </Link>
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 border-2 border-maroon text-maroon px-6 py-3 rounded-xl font-semibold hover:bg-beige transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          Registration is free and takes under a minute.
        </p>
      </div>
    </div>
  )
}
