import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Package, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import apiClient from '@/lib/axios'

interface LiveInventoryItem {
  id: string
  name: string
  category?: string
  quantity: number
  minimumStock: number
  unit?: string
  branch?: { id: string; name: string }
  branchId?: string
}

function getStatus(item: LiveInventoryItem): 'CRITICAL' | 'LOW' | 'NORMAL' {
  if (item.quantity === 0) return 'CRITICAL'
  if (item.quantity < item.minimumStock) return 'CRITICAL'
  if (item.quantity <= item.minimumStock * 1.5) return 'LOW'
  return 'NORMAL'
}

function getStatusStyle(status: string) {
  if (status === 'CRITICAL') return 'bg-red-100 text-red-700'
  if (status === 'LOW') return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
}

export function InventoryAnalyticsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['hq-inventory'],
    queryFn: async () => {
      console.log('[HQInventory] Fetching GET /inventory')
      const response = await apiClient.get('/inventory')
      console.log('[HQInventory] Live inventory received:', response.data)
      return response.data
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  })

  const inventory: LiveInventoryItem[] = data?.inventory ?? data?.items ?? (Array.isArray(data) ? data : [])
  const alerts = inventory.filter(i => getStatus(i) !== 'NORMAL')

  console.log('[HQInventory] Total items:', inventory.length, '| Alerts:', alerts.length)

  return (
    <div>
      <PageHeader
        title="Inventory Analytics"
        subtitle="Cross-branch stock levels — live from PostgreSQL"
        action={
          <button onClick={() => refetch()} disabled={isLoading}
            className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600 hover:border-maroon hover:text-maroon transition-colors">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-800">{alerts.length} Critical / Low Stock Alert{alerts.length > 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((item) => {
              const status = getStatus(item)
              return (
                <div key={item.id} className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.branch?.name ?? 'Unknown Branch'}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs font-medium ${status === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'}`}>
                      {item.quantity} {item.unit ?? 'servings'} remaining (min: {item.minimumStock})
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(status)}`}>
                      {status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 animate-pulse">
          Loading inventory data…
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
          Could not load inventory. Check that the backend server is running.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-maroon" />
            <h3 className="font-serif font-semibold text-maroon">All Inventory Items</h3>
            <span className="ml-auto text-xs text-gray-400">{inventory.length} items · Live from PostgreSQL</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-beige">
              <tr>
                {['Item', 'Branch', 'Category', 'Current Stock', 'Min Stock', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inventory.map((item) => {
                const status = getStatus(item)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="px-5 py-3 text-gray-600">{item.branch?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{item.category ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`font-bold ${status === 'CRITICAL' ? 'text-red-600' : status === 'LOW' ? 'text-amber-600' : 'text-gray-700'}`}>
                        {item.quantity}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">{item.unit ?? 'serving'}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{item.minimumStock} <span className="text-xs text-gray-400">{item.unit ?? 'serving'}</span></td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusStyle(status)}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No inventory data. Add stock items via the Branch Manager inventory page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
