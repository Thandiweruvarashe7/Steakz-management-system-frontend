import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, getElapsedTime } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { orderService } from '@/services/order.service'

export function ReadyOrdersPage() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['orders', 'ready', user?.branchId],
    queryFn: async () => {
      console.log('[ReadyOrders] Fetching live orders for branch:', user?.branchId)
      const all = await orderService.getLiveOrders()
      const ready = all.filter((o) => o.status === 'READY' || o.status === 'ON_TABLE')
      console.log('[ReadyOrders] Ready/OnTable orders:', ready.length)
      return ready
    },
    staleTime: 0,
    refetchInterval: 20_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const serveMutation = useMutation({
    mutationFn: (id: string) => {
      console.log('[ReadyOrders] Marking order as ON_TABLE:', id)
      return orderService.updateOrderStatus(id, 'ON_TABLE')
    },
    onSuccess: () => {
      toast({ title: 'Order marked as On the Table', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['orders', 'ready'] })
      qc.invalidateQueries({ queryKey: ['orders', 'live'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string })?.message ?? 'Failed to update order'
      console.error('[ReadyOrders] serveMutation failed:', msg)
      toast({ title: 'Failed to update order', description: msg, variant: 'destructive' })
    },
  })

  return (
    <div>
      <PageHeader
        title="Ready Orders"
        subtitle="Orders ready to be served to guests · auto-refreshes every 15s"
        action={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg text-sm hover:border-maroon hover:text-maroon transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No orders ready"
          description="Orders marked as ready by the kitchen will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => {
            const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total
            return (
              <div key={order.id} className="bg-white rounded-xl border-l-4 border-green-500 border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-maroon text-lg">
                      {order.table ? `Table ${order.table.tableNumber}` : 'Takeaway'}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      Ready for {getElapsedTime(order.updatedAt ?? order.createdAt)}
                    </div>
                    {order.customer && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                    )}
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full border border-green-200">
                    {order.status}
                  </span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {order.items.map((item) => {
                    const price = typeof item.unitPrice === 'string'
                      ? parseFloat(item.unitPrice)
                      : (item.unitPrice ?? 0)
                    return (
                      <li key={item.id} className="flex justify-between text-sm text-gray-600">
                        <span>{item.quantity}× {item.menuItem?.name}</span>
                        <span>{formatCurrency(price * item.quantity)}</span>
                      </li>
                    )
                  })}
                </ul>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-maroon">{formatCurrency(total)}</span>
                  {order.status === 'READY' && (
                    <button
                      onClick={() => serveMutation.mutate(order.id)}
                      disabled={serveMutation.isPending}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {serveMutation.isPending ? 'Updating…' : 'Delivered to Table'}
                    </button>
                  )}
                  {order.status === 'ON_TABLE' && (
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-lg">
                      On the Table
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
