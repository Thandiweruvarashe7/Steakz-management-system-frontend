import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Package, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { SkeletonList } from '@/components/ui/SkeletonCard'
import { toast } from '@/components/ui/use-toast'
import { inventoryService, type InventoryItem } from '@/services/inventory.service'

export function InventoryPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [restockId, setRestockId] = useState<string | null>(null)
  const [restockQty, setRestockQty] = useState(10)
  const qc = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryService.getInventory(),
    refetchInterval: 60_000,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  const restockMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) =>
      inventoryService.updateInventoryItem(id, { quantity: qty, transactionType: 'IN', notes: 'Manual restock' }),
    onSuccess: () => {
      toast({ title: 'Stock updated', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['inventory'] })
      setRestockId(null)
    },
    onError: (err: any) => {
      const msg = err?.message ?? err?.response?.data?.message ?? 'Failed to update stock'
      console.error('[Inventory] restock failed:', msg, err)
      toast({ title: 'Failed to update stock', description: msg, variant: 'destructive' })
    },
  })

  const inventory = data?.inventory ?? []
  const lowStockCount = data?.lowStockCount ?? 0

  const categories = ['all', ...[...new Set(
    inventory.map((i: InventoryItem) => i.category ?? 'Uncategorised').filter(Boolean).sort()
  )] as string[]]

  console.log('[Inventory] Loaded', inventory.length, 'items | categories:', categories.length - 1, '| filter:', categoryFilter)

  const filtered = inventory.filter((item: InventoryItem) => {
    const matchCat = categoryFilter === 'all' || (item.category ?? 'Uncategorised') === categoryFilter
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function getStockLevel(item: InventoryItem): 'critical' | 'low' | 'ok' {
    if (item.quantity === 0) return 'critical'
    if (item.quantity <= item.minimumStock) return 'low'
    return 'ok'
  }

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Monitor stock levels and manage reorders" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1"><Package className="w-4 h-4 text-maroon" /><span className="text-xs text-gray-500">Total Items</span></div>
          <p className="text-2xl font-bold text-maroon">{inventory.length}</p>
        </div>
        <div className={`rounded-xl border p-4 ${lowStockCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-1"><TrendingDown className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-600' : 'text-gray-400'}`} /><span className="text-xs text-gray-500">Low Stock</span></div>
          <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-700' : 'text-gray-400'}`}>{lowStockCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-500">Out of Stock</span></div>
          <p className="text-2xl font-bold text-red-600">{inventory.filter((i: InventoryItem) => i.quantity === 0).length}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-3 items-center">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-maroon focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>
        <SearchInput value={search} onChange={setSearch} placeholder="Search inventory…" />
      </div>

      {isLoading ? (
        <SkeletonList items={6} />
      ) : error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Could not load inventory. Check that the backend server is running.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Item</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Category</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Qty / Unit</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Min Stock</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item: InventoryItem) => {
                const level = getStockLevel(item)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{item.name}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-sm">{item.category ?? '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`font-bold ${level === 'critical' ? 'text-red-600' : level === 'low' ? 'text-amber-600' : 'text-gray-700'}`}>{item.quantity}</span>
                      <span className="text-xs text-gray-400 ml-1">{item.unit ?? 'serving'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-500">{item.minimumStock} <span className="text-xs text-gray-400">{item.unit ?? 'serving'}</span></td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${level === 'critical' ? 'bg-red-100 text-red-700' : level === 'low' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {level === 'critical' ? 'Out of Stock' : level === 'low' ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {restockId === item.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <input type="number" min={1} value={restockQty} onChange={(e) => setRestockQty(Number(e.target.value))}
                            className="w-16 border border-gray-200 rounded px-2 py-1 text-xs text-center" />
                          <span className="text-xs text-gray-400">{item.unit ?? 'servings'}</span>
                          <button onClick={() => restockMutation.mutate({ id: item.id, qty: restockQty })} disabled={restockMutation.isPending}
                            className="text-xs bg-maroon text-white px-2 py-1 rounded hover:bg-maroon-dark">Add</button>
                          <button onClick={() => setRestockId(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setRestockId(item.id); setRestockQty(10) }}
                          className="flex items-center gap-1 text-xs text-maroon hover:text-maroon-dark font-medium mx-auto">
                          <RefreshCw className="w-3 h-3" /> Restock
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400"><Package className="w-8 h-8 mx-auto mb-2 opacity-30" />No items found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
