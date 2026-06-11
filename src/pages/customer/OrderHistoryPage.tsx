import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, Printer, Download, History, CalendarDays, Clock, Users, ShoppingBag } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/SkeletonCard'
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils'
import { orderService, type BackendOrder } from '@/services/order.service'
import { reservationService } from '@/services/reservation.service'
import type { Reservation } from '@/types'

type Tab = 'orders' | 'reservations'

export function OrderHistoryPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('orders')

  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ['orders', 'my'],
    queryFn: async () => {
      console.log('[OrderHistory] Fetching orders from GET /orders')
      const result = await orderService.getOrders()
      console.log('[OrderHistory] ORDERS RESPONSE:', result.length, 'orders')
      return result
    },
    retry: false,
    refetchOnMount: true,
    staleTime: 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  })

  const {
    data: reservations = [],
    isLoading: reservationsLoading,
    error: reservationsError,
  } = useQuery({
    queryKey: ['reservations', 'my'],
    queryFn: async () => {
      console.log('[OrderHistory] Fetching reservations from GET /reservations')
      const result = await reservationService.getReservations()
      console.log('[OrderHistory] RESERVATIONS RESPONSE:', result.length, 'reservations')
      return result
    },
    refetchOnMount: true,
    staleTime: 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  })

  function handleViewReceipt(order: BackendOrder) {
    console.log('[OrderHistory] Opening receipt popup for order:', order.id)
    const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total
    const subtotal = total / 1.2
    const vat = total - subtotal
    const itemRows = order.items.map((i) => {
      const price = typeof i.unitPrice === 'string' ? parseFloat(i.unitPrice) : (i.unitPrice ?? 0)
      return `<div style="display:flex;justify-content:space-between;margin:4px 0"><span>${i.quantity}× ${i.menuItem?.name ?? 'Item'}</span><span>£${(price * i.quantity).toFixed(2)}</span></div>`
    }).join('')
    const html = `<!DOCTYPE html><html><head><title>Receipt #${order.id.slice(-8).toUpperCase()}</title>
    <style>
      body{font-family:'Courier New',monospace;width:320px;margin:0 auto;padding:20px;font-size:13px}
      .center{text-align:center}.brand{font-size:18px;font-weight:bold;letter-spacing:3px}
      hr{border:none;border-top:1px dashed #999;margin:12px 0}
      .row{display:flex;justify-content:space-between;margin:4px 0}
      .total{display:flex;justify-content:space-between;font-weight:bold;font-size:15px;border-top:2px solid #000;padding-top:8px;margin-top:8px}
      @media print{@page{size:80mm auto;margin:0.5cm}}
    </style></head><body>
    <div class="center"><div class="brand">STEAKZ UK</div>
    <div>${(order.branch as { name?: string } | undefined)?.name ?? 'STEAKZ'}</div></div>
    <hr/>
    <div class="row"><span>Order:</span><span>#${order.id.slice(-8).toUpperCase()}</span></div>
    <div class="row"><span>Date:</span><span>${new Date(order.createdAt).toLocaleDateString('en-GB')}</span></div>
    <hr/>${itemRows}<hr/>
    <div class="row"><span>Subtotal</span><span>£${subtotal.toFixed(2)}</span></div>
    <div class="row"><span>VAT (20%)</span><span>£${vat.toFixed(2)}</span></div>
    <div class="total"><span>TOTAL</span><span>£${total.toFixed(2)}</span></div>
    <div class="center" style="margin-top:16px;font-size:11px">Thank you for dining at STEAKZ UK!</div>
    <script>window.onload=function(){window.print();setTimeout(function(){window.close()},1500)}</script>
    </body></html>`
    const win = window.open('', '_blank', 'width=420,height=600')
    if (win) { win.document.open(); win.document.write(html); win.document.close() }
    else console.warn('[OrderHistory] Popup blocked — cannot open receipt window')
  }

  function handleDownloadReceipt(order: BackendOrder) {
    console.log('[OrderHistory] Downloading receipt for order:', order.id)
    const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total
    const subtotal = total / 1.2
    const vat = total - subtotal
    const lines = [
      '================================',
      '          STEAKZ UK             ',
      `  ${(order.branch as { name?: string } | undefined)?.name ?? 'STEAKZ'}  `,
      '================================',
      `Order: #${order.id.slice(-8).toUpperCase()}`,
      `Date:  ${new Date(order.createdAt).toLocaleDateString('en-GB')}`,
      '--------------------------------',
      ...order.items.map((i) => {
        const price = typeof i.unitPrice === 'string' ? parseFloat(i.unitPrice) : (i.unitPrice ?? 0)
        return `${i.quantity}x ${i.menuItem?.name ?? 'Item'} - £${(price * i.quantity).toFixed(2)}`
      }),
      '--------------------------------',
      `Subtotal: £${subtotal.toFixed(2)}`,
      `VAT 20%:  £${vat.toFixed(2)}`,
      '================================',
      `TOTAL:    £${total.toFixed(2)}`,
      '================================',
      'Thank you for dining at STEAKZ!',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `STEAKZ-Receipt-${order.id.slice(-8).toUpperCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Detect 403 from our custom apiError (statusCode) OR raw axios response.status
  const ordersForbidden =
    ordersError &&
    ((ordersError as { statusCode?: number }).statusCode === 403 ||
      (ordersError as { response?: { status?: number } }).response?.status === 403 ||
      String(ordersError).includes('403'))

  if (ordersError) {
    console.log('[OrderHistory] Orders error:', (ordersError as { statusCode?: number; message?: string })?.statusCode, (ordersError as { message?: string })?.message)
  }

  return (
    <div>
      <PageHeader title="Order &amp; Reservation History" subtitle="Your full dining history at STEAKZ UK" />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'reservations' ? 'bg-white text-maroon shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <CalendarDays className="w-4 h-4" /> Reservations
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'orders' ? 'bg-white text-maroon shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <ShoppingBag className="w-4 h-4" /> Orders
        </button>
      </div>

      {/* ── Reservations Tab ── */}
      {activeTab === 'reservations' && (
        <>
          {reservationsLoading ? (
            <SkeletonList items={3} />
          ) : reservationsError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
              Could not load reservations. Check the backend server is running.
            </div>
          ) : reservations.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No reservations yet"
              description="Book a table to see your reservation history here."
              action={{ label: 'Book a Table', onClick: () => (window.location.href = '/reservations') }}
            />
          ) : (
            <div className="space-y-4">
              {reservations.map((res: Reservation) => (
                <div key={res.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif font-bold text-maroon">{res.branchName ?? 'STEAKZ Branch'}</h3>
                        <StatusBadge status={res.status} type="reservation" />
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-4 h-4 text-maroon" />
                          {formatDate(res.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-maroon" />
                          {res.time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-maroon" />
                          {res.partySize} {res.partySize === 1 ? 'guest' : 'guests'}
                        </span>
                        {res.tableNumber && (
                          <span className="text-xs bg-beige text-maroon px-2 py-0.5 rounded-full font-medium">
                            Table {res.tableNumber}
                          </span>
                        )}
                      </div>
                      {res.specialRequests && (
                        <p className="text-xs text-gray-400 mt-2 italic">Note: {res.specialRequests}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4 text-center">
            {reservations.length} reservation{reservations.length !== 1 ? 's' : ''} · Live from PostgreSQL
          </p>
        </>
      )}

      {/* ── Orders Tab ── */}
      {activeTab === 'orders' && (
        <>
          {ordersLoading ? (
            <SkeletonList items={3} />
          ) : ordersForbidden ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <ShoppingBag className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="font-medium text-amber-800 mb-1">Order receipts are managed at the restaurant</p>
              <p className="text-sm text-amber-600">
                Your order history is handled by our waitstaff at the branch. Use the{' '}
                <button
                  onClick={() => setActiveTab('reservations')}
                  className="underline font-medium hover:text-amber-800 transition-colors"
                >
                  Reservations
                </button>{' '}
                tab to see your full dining history.
              </p>
            </div>
          ) : ordersError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
              Could not load orders. Check the backend server is running.
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={History}
              title="No orders yet"
              description="Your order history will appear here after your first visit."
            />
          ) : (
            <div className="space-y-4">
              {orders.map((order: BackendOrder) => {
                const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total
                const subtotal = total / 1.2
                const vat = total - subtotal
                return (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div
                      className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    >
                      <div className="flex items-center gap-4 flex-wrap">
                        <div>
                          <p className="text-sm font-medium text-maroon">Order #{order.id.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                        </div>
                        <StatusBadge status={order.status as import('@/types').OrderStatus} type="order" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-maroon">{formatCurrency(total)}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewReceipt(order) }}
                          className="flex items-center gap-1 text-xs border border-gray-200 px-2.5 py-1.5 rounded-lg text-gray-500 hover:border-maroon hover:text-maroon transition-colors"
                          title="View receipt"
                        >
                          <Printer className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownloadReceipt(order) }}
                          className="flex items-center gap-1 text-xs border border-gray-200 px-2.5 py-1.5 rounded-lg text-gray-500 hover:border-maroon hover:text-maroon transition-colors"
                          title="Download receipt"
                        >
                          <Download className="w-3.5 h-3.5" /> Save
                        </button>
                        {expanded === order.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>

                    {expanded === order.id && (
                      <div className="border-t border-gray-100 p-5">
                        <div className="space-y-3 mb-4">
                          {order.items.map((item) => {
                            const unitPrice = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice
                            return (
                              <div key={item.id} className="flex justify-between items-start text-sm">
                                <div>
                                  <span className="font-medium text-gray-800">{item.menuItem.name}</span>
                                  <span className="text-gray-500 ml-2">×{item.quantity}</span>
                                </div>
                                <span className="text-gray-600">{formatCurrency(unitPrice * item.quantity)}</span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="border-t border-gray-100 pt-4 space-y-1 text-sm">
                          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                          <div className="flex justify-between text-gray-500"><span>VAT (20%)</span><span>{formatCurrency(vat)}</span></div>
                          <div className="flex justify-between font-semibold text-maroon text-base pt-1 border-t border-gray-100 mt-1">
                            <span>Total</span><span>{formatCurrency(total)}</span>
                          </div>
                          {order.branch && <p className="text-xs text-gray-400 mt-1">Branch: {order.branch.name}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          {!ordersForbidden && !ordersLoading && (
            <p className="text-xs text-gray-400 mt-4 text-center">{orders.length} orders · Live from PostgreSQL</p>
          )}
        </>
      )}
    </div>
  )
}
