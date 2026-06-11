import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/queries/auth.queries'
import { PUBLIC_NAV } from '@/constants/nav'
import { ROLE_LABELS, ROLE_DASHBOARD_ROUTES } from '@/constants/roles'
import { getInitials } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { useBasketStore, selectItemCount } from '@/stores/basket.store'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, isAuthenticated, role } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()
  const rawItemCount = useBasketStore(selectItemCount)
  const itemCount = isAuthenticated ? rawItemCount : 0

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  async function handleLogout() {
    try {
      await logout.mutateAsync()
      navigate('/')
      toast({ title: 'Signed out successfully', variant: 'success' })
    } catch {
      toast({ title: 'Sign out failed', variant: 'destructive' })
    }
    setUserMenuOpen(false)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-maroon/95 backdrop-blur-md shadow-lg' : 'bg-maroon'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-serif font-bold text-white tracking-wider">STEAKZ</span>
            <span className="text-gold text-xs font-medium tracking-widest uppercase hidden sm:block">UK</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {PUBLIC_NAV.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors relative pb-1 ${
                    isActive
                      ? 'text-gold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gold'
                      : 'text-white/80 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop right — basket + auth */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Basket icon */}
            <Link to="/basket" className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
              <ShoppingBag className="w-5 h-5 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-maroon text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full pl-1 pr-3 py-1 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-maroon text-xs font-bold">
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <span className="text-white text-sm">{user.firstName}</span>
                  <ChevronDown className="w-4 h-4 text-white/70" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-maroon">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{role ? ROLE_LABELS[role] : ''}</p>
                    </div>
                    {role && (
                      <Link
                        to={ROLE_DASHBOARD_ROUTES[role]}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-beige transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                    )}
                    <Link
                      to="/customer/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-beige transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="text-sm font-medium bg-gold text-maroon px-4 py-2 rounded-lg hover:bg-gold-light transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile: basket + toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <Link to="/basket" className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
              <ShoppingBag className="w-5 h-5 text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-maroon text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-2">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-maroon-dark border-t border-white/10">
          <div className="px-4 py-4 space-y-2">
            {PUBLIC_NAV.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/20 text-gold' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/basket"
              className="flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white text-sm"
              onClick={() => setMobileOpen(false)}
            >
              <ShoppingBag className="w-4 h-4" />
              Basket
              {itemCount > 0 && (
                <span className="bg-gold text-maroon text-xs font-bold px-1.5 py-0.5 rounded-full ml-auto">{itemCount}</span>
              )}
            </Link>
            <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-white text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-white/60 text-xs">{role ? ROLE_LABELS[role] : ''}</p>
                  </div>
                  {role && (
                    <Link
                      to={ROLE_DASHBOARD_ROUTES[role]}
                      className="block px-3 py-2 text-white/80 hover:text-white text-sm"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false) }}
                    className="w-full text-left px-3 py-2 text-red-300 text-sm"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 text-white/80 hover:text-white text-sm" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                  <Link to="/register" className="block px-3 py-2 bg-gold text-maroon rounded-lg text-sm font-medium text-center" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
