import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingBag, MapPin } from 'lucide-react'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { MenuCategoryFilter } from '@/components/menu/MenuCategoryFilter'
import { SearchInput } from '@/components/ui/SearchInput'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/hooks/useAuth'
import { useBasketStore, selectBranchId } from '@/stores/basket.store'
import { toast } from '@/components/ui/use-toast'
import { STATIC_MENU_ITEMS, STATIC_BRANCHES } from '@/constants/nav'
import type { MenuCategory, MenuItem } from '@/types'
import apiClient from '@/lib/axios'

export function MenuPage() {
  const [category, setCategory] = useState('all')
  const [searchRaw, setSearchRaw] = useState('')
  const search = useDebounce(searchRaw, 250)
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')

  const { isAuthenticated, canPlaceOrders } = useAuth()
  const addItem = useBasketStore((s) => s.addItem)
  const clearBasket = useBasketStore((s) => s.clearBasket)
  const basketBranchId = useBasketStore(selectBranchId)
  const navigate = useNavigate()

  const { data: liveMenuData } = useQuery({
    queryKey: ['menu-items', selectedBranchId],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (selectedBranchId) params.branchId = selectedBranchId
      console.log('[MenuPage] Fetching GET /menu', params)
      try {
        const response = await apiClient.get('/menu', { params })
        console.log('[MenuPage] Live menu received:', response.data)
        return response.data
      } catch (err) {
        console.warn('[MenuPage] /menu failed, trying /menu-items:', err)
        const fallback = await apiClient.get('/menu-items', { params })
        console.log('[MenuPage] /menu-items fallback received:', fallback.data)
        return fallback.data
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  })

  function extractItems(data: unknown): MenuItem[] {
    if (!data || typeof data !== 'object') return STATIC_MENU_ITEMS
    const d = data as Record<string, unknown>
    if (Array.isArray(d)) return d as MenuItem[]
    if (Array.isArray(d.menuItems)) return d.menuItems as MenuItem[]
    if (Array.isArray(d.items)) return d.items as MenuItem[]
    if (Array.isArray(d.categories)) {
      return (d.categories as Array<{ name: string; items: unknown[] }>).flatMap((cat) =>
        (cat.items ?? []).map((item) => {
          const i = item as Record<string, unknown>
          return {
            id:          i.id as string,
            name:        i.name as string,
            description: (i.description as string) ?? '',
            price:       typeof i.price === 'string' ? parseFloat(i.price as string) : (i.price as number),
            category:    cat.name as MenuCategory,
            imageUrl:    i.imageUrl as string | undefined,
            isAvailable: i.isAvailable as boolean,
            allergens:   [] as string[],
          }
        })
      )
    }
    return STATIC_MENU_ITEMS
  }

  const allMenuItems: MenuItem[] = extractItems(liveMenuData)
  console.log('[MenuPage] Menu items loaded:', allMenuItems.length, '| source:', liveMenuData ? 'API' : 'STATIC_FALLBACK')

  const filtered = useMemo(() => {
    return allMenuItems.filter((item) => {
      const rawCat = item.category as unknown
      const itemCategory: string =
        rawCat && typeof rawCat === 'object'
          ? ((rawCat as { name?: string }).name ?? '').toUpperCase()
          : String((rawCat as MenuCategory) ?? '').toUpperCase()
      const matchCat = category === 'all' || itemCategory === (category as string).toUpperCase()
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [allMenuItems, category, search])

  function handleAddToBasket(item: MenuItem, cookingPreference?: string) {
    if (!isAuthenticated) {
      toast({ title: 'Sign in to add items to your basket', description: 'Create a free account or sign in to continue.', variant: 'destructive' })
      navigate('/login', { state: { from: '/menu' } })
      return
    }

    if (!canPlaceOrders) {
      toast({ title: 'Not permitted', description: 'Only customers or waiters can place orders. Please sign in with a customer account to order, or speak to a member of staff who can take your order at the table.', variant: 'destructive' })
      return
    }

    if ((item as any).inventoryStatus === 'OUT_OF_STOCK') {
      toast({ title: 'Cannot order item: Out of Stock', variant: 'destructive' })
      return
    }

    const branchId = selectedBranchId || undefined

    // If basket already has items from a different branch, warn and clear
    if (basketBranchId && branchId && basketBranchId !== branchId) {
      toast({
        title: 'Switching branch',
        description: 'Your basket has been cleared to order from the new branch.',
        variant: 'destructive',
      })
      clearBasket()
    }

    console.log('[Menu] Adding to basket — item:', item.name, '| branchId:', branchId ?? 'none selected')
    addItem(item, cookingPreference, branchId)
    toast({ title: `${item.name} added to basket!`, variant: 'success' })
  }

  return (
    <div className="bg-beige-light min-h-screen">
      {/* Hero banner */}
      <div className="bg-luxury py-16 text-center px-4">
        <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Our Offerings</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">The Menu</h1>
        <p className="text-white/70 max-w-xl mx-auto">
          Crafted with care, every dish reflects our commitment to quality. Explore freely — sign in to order.
        </p>
      </div>

      {/* Guest notice */}
      {!isAuthenticated && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-amber-800 text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Browse freely — <strong>sign in or register</strong> to add items to your basket and place orders.
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => navigate('/login', { state: { from: '/menu' } })} className="text-xs font-semibold text-maroon hover:underline">Sign In</button>
              <span className="text-amber-400">·</span>
              <button onClick={() => navigate('/register')} className="text-xs font-semibold text-maroon hover:underline">Register Free</button>
            </div>
          </div>
        </div>
      )}

      {/* Staff role notice — shown when a non-customer/non-waiter is signed in */}
      {isAuthenticated && !canPlaceOrders && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-amber-800 text-sm">
              <strong>Ordering not available for your role.</strong>{' '}
              Only customers or waiters can place orders. Please sign in with a customer account to order, or speak to a member of staff who can take your order at the table.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Branch selector — only shown to roles that can place orders */}
        {isAuthenticated && canPlaceOrders && (
          <div className="flex items-center gap-3 mb-6 bg-white rounded-xl border border-gray-100 p-4">
            <MapPin className="w-4 h-4 text-maroon flex-shrink-0" />
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Ordering from:</label>
            <select
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value)
                console.log('[Menu] Branch selected for order:', e.target.value)
              }}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
            >
              <option value="">Select a branch…</option>
              {STATIC_BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>{b.name} – {b.city}</option>
              ))}
            </select>
            {basketBranchId && (
              <span className="text-xs text-green-600 font-medium whitespace-nowrap">Branch saved ✓</span>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <MenuCategoryFilter value={category} onChange={setCategory} />
          </div>
          <SearchInput value={searchRaw} onChange={setSearchRaw} placeholder="Search dishes..." className="sm:w-72" />
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Showing {filtered.length} {filtered.length === 1 ? 'dish' : 'dishes'}
          {category !== 'all' && ` in ${category.charAt(0) + category.slice(1).toLowerCase()}`}
          {search && ` matching "${search}"`}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No dishes found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                showOrderButton
                onAddToOrder={handleAddToBasket}
                basketMode
                inventoryStatus={(item as any).inventoryStatus}
                orderPermissionMessage={isAuthenticated && !canPlaceOrders ? 'Only customers or waiters can place orders. Please sign in with a customer account, or speak to a member of staff.' : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
