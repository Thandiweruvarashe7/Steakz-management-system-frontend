import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { DollarSign, CreditCard, Banknote, CheckCircle, RefreshCw, Smartphone } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import apiClient from '@/lib/axios'

type PaymentMethod = 'CARD' | 'CASH' | 'MOBILE'

export function WaiterPaymentsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<string | null>(null)
  const [method, setMethod] = useState<PaymentMethod>('CARD')
  const [processedToday, setProcessedToday] = useState(0)

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['orders', 'awaiting-payment', user?.branchId],
    queryFn: async () => {
      console.log('[Payments] Fetching awaiting-payment orders for branch:', user?.branchId)
      const response = await apiClient.get('/orders/awaiting-payment')
      console.log('[Payments] Awaiting payment orders:', response.data.orders?.length ?? 0)
      return response.data.orders ?? []
    },
    staleTime: 0,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  })

  const paymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      // Map UI method to backend-accepted values
      const backendMethod = method === 'MOBILE' ? 'CONTACTLESS' : method
      console.log('[Payments] Processing payment for order:', orderId, '| method:', backendMethod)
      const r = await apiClient.post('/payments', { orderId, method: backendMethod })
      return r.data
    },
    onSuccess: () => {
      setProcessedToday((c) => c + 1)
      setSelected(null)
      qc.invalidateQueries({ queryKey: ['orders', 'awaiting-payment'] })
      qc.invalidateQueries({ queryKey: ['orders', 'live'] })
      qc.invalidateQueries({ queryKey: ['receipts'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
      qc.invalidateQueries({ queryKey: ['hq-dashboard'] })
      qc.invalidateQueries({ queryKey: ['revenue-trend'] })
      toast({ title: 'Payment processed — order moved to Receipts', variant: 'success' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Payment failed'
      console.error('[Payments] Error processing payment:', err)
      toast({ title: msg, variant: 'destructive' })
    },
  })

  const selectedOrder = orders.find((o: { id: string }) => o.id === selected)

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Process payments for served tables"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Orders awaiting payment */}
        <div>
          <h3 className="font-serif font-semibold text-maroon mb-4">Awaiting Payment</h3>
          {isLoading ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 animate-pulse">
              Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <EmptyState icon={DollarSign} title="No pending payments" description="All tables have been settled." />
          ) : (
            <div className="space-y-3">
              {orders.map((order: {
                id: string
                total: number | string
                items?: unknown[]
                table?: { tableNumber: number } | null
                customer?: { firstName: string; lastName: string }
              }) => {
                const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelected(order.id)}
                    className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${
                      selected === order.id ? 'border-maroon ring-2 ring-maroon/20' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-maroon">
                          {order.table ? `Table ${order.table.tableNumber}` : 'Takeaway Order'}
                        </h4>
                        <p className="text-sm text-gray-500">{order.items?.length ?? 0} items</p>
                        {order.customer && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {order.customer.firstName} {order.customer.lastName}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <span className="font-bold text-lg text-maroon">{formatCurrency(total)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {processedToday > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
              <p className="text-xs text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {processedToday} payment{processedToday > 1 ? 's' : ''} processed today
              </p>
            </div>
          )}
        </div>

        {/* Right: Payment method selector */}
        <div>
          <h3 className="font-serif font-semibold text-maroon mb-4">Payment Method</h3>
          {selectedOrder ? (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              {/* Order summary */}
              <div className="mb-4 p-3 bg-beige rounded-lg">
                <p className="font-medium text-sm text-maroon mb-2">
                  {(selectedOrder as { table?: { tableNumber: number } | null }).table
                    ? `Table ${(selectedOrder as { table: { tableNumber: number } }).table.tableNumber}`
                    : 'Takeaway'}{' '}
                  — Order #{(selectedOrder as { id: string }).id.slice(-8).toUpperCase()}
                </p>
                <div className="space-y-1">
                  {((selectedOrder as { items?: { id: string; quantity: number; unitPrice: number | string; menuItem?: { name: string } }[] }).items ?? []).map((item) => {
                    const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : (item.unitPrice ?? 0)
                    return (
                      <div key={item.id} className="flex justify-between text-xs text-gray-600">
                        <span>{item.quantity}× {item.menuItem?.name}</span>
                        <span>{formatCurrency(price * item.quantity)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-maroon/20 mt-2 pt-2 flex justify-between font-bold text-sm text-maroon">
                  <span>Total</span>
                  <span>
                    {formatCurrency(
                      typeof (selectedOrder as { total: number | string }).total === 'string'
                        ? parseFloat((selectedOrder as { total: string }).total)
                        : (selectedOrder as { total: number }).total
                    )}
                  </span>
                </div>
              </div>

              {/* Payment method buttons */}
              <div className="space-y-2 mb-4">
                {([
                  { value: 'CARD',   label: 'Credit / Debit Card', icon: CreditCard,  sub: 'Visa, Mastercard, Amex' },
                  { value: 'CASH',   label: 'Cash',                icon: Banknote,    sub: 'Physical cash payment' },
                  { value: 'MOBILE', label: 'Mobile Payment',      icon: Smartphone,  sub: 'Apple Pay / Google Pay' },
                ] as const).map(({ value, label, icon: Icon, sub }) => (
                  <button
                    key={value}
                    onClick={() => setMethod(value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      method === value ? 'border-maroon bg-beige' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${method === value ? 'text-maroon' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm font-medium ${method === value ? 'text-maroon' : 'text-gray-700'}`}>{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => paymentMutation.mutate((selectedOrder as { id: string }).id)}
                disabled={paymentMutation.isPending}
                className="w-full bg-maroon text-white py-3 rounded-xl font-semibold hover:bg-maroon-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {paymentMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm Payment ({method})
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
              <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select an order from the left to process payment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
