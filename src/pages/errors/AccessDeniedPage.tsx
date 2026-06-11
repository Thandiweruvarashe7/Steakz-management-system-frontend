import { ShieldX, ArrowLeft, Home } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { ROLE_DASHBOARD_ROUTES, ROLE_LABELS } from '@/constants/roles'

export function AccessDeniedPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const attemptedPath = (location.state as { from?: string })?.from || location.pathname

  return (
    <div className="min-h-screen bg-beige flex flex-col items-center justify-center px-4 text-center">
      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <ShieldX className="w-12 h-12 text-red-500" />
      </div>

      {/* Heading */}
      <p className="text-6xl font-bold text-red-200 font-mono mb-2">403</p>
      <h1 className="font-serif text-3xl font-bold text-maroon mb-3">Access Denied</h1>
      <p className="text-gray-500 max-w-md mb-2">
        You don't have permission to access this resource.
      </p>
      {attemptedPath && (
        <p className="text-xs text-gray-400 font-mono bg-white border border-gray-100 px-3 py-1 rounded-full mb-8">
          {attemptedPath}
        </p>
      )}

      {/* Role info */}
      {user && (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 mb-8 text-sm">
          <p className="text-gray-500">
            You are signed in as{' '}
            <span className="font-semibold text-maroon">{user.firstName} {user.lastName}</span>
            {' '}({ROLE_LABELS[user.role]}).
          </p>
          {user.branchId && (
            <p className="text-xs text-gray-400 mt-0.5">Branch restricted access — your branch only.</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:border-maroon hover:text-maroon transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>

        {user ? (
          <Link
            to={ROLE_DASHBOARD_ROUTES[user.role]}
            className="flex items-center gap-2 bg-maroon text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-maroon-dark transition-colors"
          >
            <Home className="w-4 h-4" /> My Dashboard
          </Link>
        ) : (
          <Link
            to="/"
            className="flex items-center gap-2 bg-maroon text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-maroon-dark transition-colors"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
        )}
      </div>

      {/* Branch manager note */}
      {user?.role === 'BRANCH_MANAGER' && (
        <div className="mt-10 max-w-md p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <strong>Branch Managers</strong> can only access data for their assigned branch.
          Contact your HQ Manager if you need cross-branch access.
        </div>
      )}
    </div>
  )
}
