import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/queries/auth.queries'
import { ROLE_LABELS, ROLE_COLORS } from '@/constants/roles'
import { getInitials, cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui.store'
import { toast } from '@/components/ui/use-toast'
import type { NavItem } from '@/constants/nav'

interface DashboardSidebarProps {
  navItems: NavItem[]
}

export function DashboardSidebar({ navItems }: DashboardSidebarProps) {
  const { user, role } = useAuth()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const logout = useLogout()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout.mutateAsync()
      navigate('/')
      toast({ title: 'Signed out successfully', variant: 'success' })
    } catch {
      toast({ title: 'Sign out failed', variant: 'destructive' })
    }
  }

  return (
    <aside className={cn(
      'hidden lg:flex flex-col bg-maroon text-white transition-all duration-300 flex-shrink-0',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
        {sidebarOpen && (
          <span className="text-xl font-serif font-bold text-white">STEAKZ</span>
        )}
        <button
          onClick={toggleSidebar}
          className={cn('p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-auto', !sidebarOpen && 'mx-auto')}
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                  isActive
                    ? 'bg-gold text-maroon font-medium'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                  !sidebarOpen && 'justify-center'
                )
              }
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-3">
        {user && (
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-maroon text-xs font-bold flex-shrink-0">
              {getInitials(user.firstName, user.lastName)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                {role && (
                  <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', ROLE_COLORS[role])}>
                    {ROLE_LABELS[role]}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 mt-3 px-3 py-2 rounded-lg text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-colors text-sm',
            !sidebarOpen && 'justify-center'
          )}
          title={!sidebarOpen ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
