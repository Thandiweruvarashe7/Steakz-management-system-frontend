import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, ChefHat, CheckCircle, CreditCard, Printer, UtensilsCrossed, AlertCircle, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SkeletonList } from '@/components/ui/SkeletonCard'
import { toast } from '@/components/ui/use-toast'
import { formatCurrency, getElapsedTime, formatDateTime, generateReceiptNumber } from '@/lib/utils'
import { orderService, type BackendOrder } from '@/services/order.service'

const COLUMNS: { status: string; label: string; icon: React.ElementType; border: string; badge: string }[] = [
  { status: 'PENDING',   label: 'New Orders',     icon: AlertCircle,     border: 'border-yellow-400', badge: 'bg-yellow-100 text-yellow-800' },
  { status: 'PREPARING', label: 'In Kitchen',     icon: ChefHat,         border: 'border-orange-400', badge: 'bg-orange-100 text-orange-800' },
  { status: 'READY',     label: 'Ready to Serve', icon: CheckCircle,     border: 'border-green-400',  badge: 'bg-green-100 text-green-800' },
  { status: 'ON_TABLE',  label: 'On the Table',   icon: UtensilsCrossed, border: 'border-blue-400',   badge: 'bg-blue-100 text-blue-800' },
]

const NEXT_STATUS: Record<string, string> = { PENDING: 'PREPARING', PREPARING: 'READY', READY: 'ON_TABLE', ON_TABLE: 'SERVED' }
const NEXT_LABEL: Record<string, string> = { PENDING: 'Start Preparing', PREPARING: 'Mark Ready', READY: 'Delivered to Table', ON_TABLE: 'Mark Served' }

function printOrderReceipt(order: BackendOrder) {
  const receiptNo = generateReceiptNumber()
  const win = window.open('', 'receipt', 'width=380,height=650')
  if (!win) return
  const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total
  const subtotal = total / 1.2
  const vat = total - subtotal

  const items = order.items.map((i) => {
    const price = typeof i.unitPrice === 'string' ? parseFloat(i.unitPrice) : i.unitPrice
    return `<div style="display:flex;justify-content:space-between;margin-bottom:6px;">
      <span>${i.quantity}× ${i.menuItem.name}</span>
      <span>£${(price * i.quantity).toFixed(2)}</span>
    </div>`
  }).join('')

  win.document.write(`<!DOCTYPE html><html><head><title>Receipt</title>
    <style>body{font-family:monospace;font-size:12px;padding:24px;max-width:320px;margin:auto}
    h1{font-size:18px;font-weight:bold;text-align:center;margin:0}
    .sub{font-size:11px;color:#666;text-align:center;margin:2px 0}
    .divider{border-top:1px dashed #ccc;margin:12px 0}
    .row{display:flex;justify-content:space-between;margin:4px 0}
    .total{font-weight:bold;font-size:14px;border-top:1px solid #000;padding-top:6px;margin-top:6px}
    </style></head><body>
    <h1>STEAKZ UK</h1>
    <p class="sub">${order.branch?.name ?? 'STEAKZ Restaurant'}</p>
    <div class="divider"></div>
    <div class="row"><span>Receipt:</span><span>${receiptNo}</span></div>
    <div class="row"><span>Date:</span><span>${formatDateTime(order.createdAt)}</span></div>
    <div class="row"><span>Table:</span><span>${order.table ? 'T' + order.table.tableNumber : 'Takeaway'}</span></div>
    <div class="row"><span>Order:</span><span>#${order.id.slice(-8).toUpperCase()}</span></div>
    <div class="divider"></div>
    <strong>ITEMS</strong><div style="margin-top:8px">${items}</div>
    <div class="divider"></div>
    <div class="row"><span>Subtotal</span><span>£${subtotal.toFixed(2)}</span></div>
    <div class="row" style="color:#666"><span>VAT (20%)</span><span>£${vat.toFixed(2)}</span></div>
    <div class="row total"><span>TOTAL</span><span>£${total.toFixed(2)}</span></div>
    <div class="divider"></div>
    <div class="row"><span>Payment:</span><span>${(order as { paymentMethod?: string }).paymentMethod ?? 'At Restaurant'}</span></div>
    <div class="row"><span>Ref:</span><span>#${order.id.slice(-8).toUpperCase()}</span></div>
    <div class="divider"></div>
    <p style="text-align:center;color:#666">Thank you for dining with us.</p>
    <p style="text-align:center;color:#999;font-size:10px">www.steakz.co.uk</p>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}</script>
    </body></html>`)
  win.document.close()
}

export function LiveOrdersPage() {
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders', 'live'],
    queryFn: () => orderService.getLiveOrders(),
    refetchInterval: 15_000,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  const advanceMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      console.log('[LiveOrders] Advancing order', id, '→', status)
      return orderService.updateOrderStatus(id, status)
    },
    onSuccess: (updatedOrder: any) => {
      console.log('[LiveOrders] Order advanced:', updatedOrder?.id, '→', updatedOrder?.status)
      qc.invalidateQueries({ queryKey: ['orders', 'live'] })
      qc.invalidateQueries({ queryKey: ['orders', 'ready'] })
      qc.invalidateQueries({ queryKey: ['orders', 'awaiting-payment'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
      if (updatedOrder?.status === 'SERVED') {
        toast({ title: 'Order served — proceed to payment', variant: 'success' })
        navigate('/waiter/payments')
      }
    },
    onError: (err: any) => {
      const msg = err?.message ?? err?.response?.data?.message ?? 'Failed to update order'
      console.error('[LiveOrders] Advance failed:', msg, err)
      toast({ title: 'Failed to update order', description: msg, variant: 'destructive' })
    },
  })

  const paymentOrder = orders.find((o: BackendOrder) => o.id === paymentOrderId)

  return (
    <div>
      <PageHeader title="Live Orders" subtitle="New → Kitchen → Ready → On Table · auto-refreshes every 15s" />

      {isLoading && orders.length === 0 ? (
        <SkeletonList items={4} />
      ) : (
        <>
          {error && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 text-amber-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  {(error as any)?.code === 'NETWORK_ERROR'
                    ? 'Cannot reach server — check backend is running'
                    : 'Refresh failed — showing last known orders · retrying every 15s'}
                </p>
              </div>
              <button
                onClick={() => qc.invalidateQueries({ queryKey: ['orders', 'live'] })}
                className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                <RefreshCw className="w-4 h-4" /> Retry Now
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {COLUMNS.map(({ status, label, icon: Icon, border, badge }) => {
              const col = orders.filter((o: BackendOrder) => o.status === status)
              return (
                <div key={status} className={`bg-white rounded-xl border-t-4 ${border} border border-gray-100 p-4 min-h-[300px]`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-800 text-sm">{label}</h3>
                    <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>{col.length}</span>
                  </div>
                  <div className="space-y-3">
                    {col.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No orders</p>}
                    {col.map((order: BackendOrder) => (
                      <OrderCard key={order.id} order={order}
                        onAdvance={() => {
                          const next = NEXT_STATUS[order.status]
                          if (next !== 'PAID') { advanceMutation.mutate({ id: order.id, status: next }) }
                        }}
                        onPrint={() => printOrderReceipt(order)}
                        isPending={advanceMutation.isPending}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Payment modal */}
      {paymentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPaymentOrderId(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif font-bold text-maroon text-lg mb-1">Receive Payment</h3>
            <p className="text-gray-500 text-sm mb-4">
              {paymentOrder.table ? `Table ${paymentOrder.table.tableNumber}` : 'Takeaway Order'} · Order #{paymentOrder.id.slice(-8).toUpperCase()}
            </p>

            <div className="bg-beige rounded-xl p-4 mb-4">
              <div className="space-y-1 mb-3">
                {paymentOrder.items.map((item) => {
                  const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.quantity}× {item.menuItem.name}</span>
                      <span>{formatCurrency(price * item.quantity)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-beige-dark/30 pt-3">
                {(() => {
                  const total = typeof paymentOrder.total === 'string' ? parseFloat(paymentOrder.total) : paymentOrder.total
                  const subtotal = total / 1.2
                  const vat = total - subtotal
                  return (
                    <>
                      <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                      <div className="flex justify-between text-sm text-gray-500"><span>VAT (20%)</span><span>{formatCurrency(vat)}</span></div>
                      <div className="flex justify-between font-bold text-maroon text-lg mt-1"><span>Total</span><span>{formatCurrency(total)}</span></div>
                    </>
                  )
                })()}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => printOrderReceipt(paymentOrder)}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:border-maroon hover:text-maroon transition-colors">
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button onClick={() => { advanceMutation.mutate({ id: paymentOrder.id, status: 'PAID' }); setPaymentOrderId(null) }}
                disabled={advanceMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-maroon text-white py-2.5 rounded-xl text-sm font-medium hover:bg-maroon-dark transition-colors disabled:opacity-50">
                <CreditCard className="w-4 h-4" /> Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OrderCard({
  order, onAdvance, onPrint, isPending,
}: {
  order: BackendOrder
  onAdvance: () => void
  onPrint: () => void
  isPending: boolean
}) {
  const navigate = useNavigate()
  const elapsed = getElapsedTime(order.createdAt)
  const isUrgent = Date.now() - new Date(order.createdAt).getTime() > 30 * 60 * 1000

  return (
    <div className={`border rounded-xl p-4 hover:shadow-sm transition-shadow ${isUrgent ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-bold text-maroon text-sm">
            {order.table ? `Table ${order.table.tableNumber}` : '🥡 Takeaway'}
          </span>
          <span className="text-gray-400 text-xs ml-1">#{order.id.slice(-6).toUpperCase()}</span>
          <p className="text-xs text-gray-500 mt-0.5">
            {order.customer
              ? `${order.customer.firstName} ${order.customer.lastName}`
              : order.waiter
                ? `Waiter: ${order.waiter.firstName} ${order.waiter.lastName}`
                : 'Walk-in'}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className={`w-3 h-3 ${isUrgent ? 'text-red-500' : ''}`} />
          <span className={isUrgent ? 'text-red-500 font-medium' : ''}>{elapsed}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        <StatusBadge status={order.status as import('@/types').OrderStatus} type="order" />
      </div>

      <ul className="space-y-1 mb-3">
        {order.items.map((item) => {
          const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice
          return (
            <li key={item.id} className="text-xs text-gray-600 flex justify-between">
              <span className="truncate mr-1">{item.quantity}× {item.menuItem.name}</span>
              <span className="text-gray-500 whitespace-nowrap">{formatCurrency(price * item.quantity)}</span>
            </li>
          )
        })}
      </ul>

      <div className="flex justify-between items-center border-t border-gray-100 pt-2 mb-3">
        <span className="text-xs text-gray-400">Total</span>
        <span className="font-bold text-maroon text-sm">
          {formatCurrency(typeof order.total === 'string' ? parseFloat(order.total) : order.total)}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {NEXT_STATUS[order.status] && (
          NEXT_STATUS[order.status] === 'PAID' ? (
            <button
              onClick={() => {
                console.log('[LiveOrders] SERVED order — navigating to Payments page:', order.id)
                navigate('/waiter/payments')
              }}
              className="w-full text-xs bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-1">
              <CreditCard className="w-3 h-3" /> Go to Payments
            </button>
          ) : (
            <button onClick={onAdvance} disabled={isPending}
              className="w-full text-xs bg-maroon text-white py-2 rounded-lg hover:bg-maroon-dark transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-1">
              {isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
              {NEXT_LABEL[order.status]}
            </button>
          )
        )}
        <button onClick={onPrint}
          className="w-full text-xs border border-gray-200 text-gray-500 py-2 rounded-lg hover:border-gray-300 transition-colors flex items-center justify-center gap-1">
          <Printer className="w-3 h-3" /> Print Receipt
        </button>
      </div>
    </div>
  )
}
