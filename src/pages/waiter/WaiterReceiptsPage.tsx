import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Printer, Search, Download, AlertCircle, Eye } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { SkeletonList } from '@/components/ui/SkeletonCard'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { orderService, type BackendOrder } from '@/services/order.service'

function buildReceiptHtml(order: BackendOrder): string {
  const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total
  const subtotal = total / 1.2
  const vat = total - subtotal
  const itemRows = order.items.map((i) => {
    const price = typeof i.unitPrice === 'string' ? parseFloat(i.unitPrice) : (i.unitPrice ?? 0)
    return `<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>${i.quantity}x ${i.menuItem?.name ?? 'Item'}</span><span>£${(price * i.quantity).toFixed(2)}</span></div>`
  }).join('')
  return `<!DOCTYPE html><html><head><title>Receipt #${order.id.slice(-8).toUpperCase()}</title>
  <style>
    body{font-family:monospace;width:300px;margin:0 auto;padding:24px;font-size:13px}
    h2{text-align:center;margin:0 0 4px}
    p.center{text-align:center;margin:2px 0}
    hr{border:none;border-top:1px dashed #aaa;margin:12px 0}
    .total{font-weight:bold;font-size:14px;display:flex;justify-content:space-between}
    .row{display:flex;justify-content:space-between;margin-bottom:2px}
    @media print{body{width:auto}}
  </style></head><body>
  <h2>STEAKZ UK</h2>
  <p class="center">Receipt #${order.id.slice(-8).toUpperCase()}</p>
  <p class="center">${new Date(order.createdAt).toLocaleString('en-GB')}</p>
  <p class="center">Table ${order.table?.tableNumber ?? '?'}</p>
  <hr/>${itemRows}<hr/>
  <div class="row"><span>Subtotal</span><span>£${subtotal.toFixed(2)}</span></div>
  <div class="row"><span>VAT (20%)</span><span>£${vat.toFixed(2)}</span></div>
  <hr/>
  <div class="total"><span>TOTAL</span><span>£${total.toFixed(2)}</span></div>
  <p class="center" style="margin-top:20px;font-size:12px">Thank you for dining with STEAKZ!</p>
  <script>window.onload=function(){window.print()}</script>
  </body></html>`
}

function printReceipt(order: BackendOrder) {
  console.log('[WaiterReceipts] Printing receipt for order:', order.id)
  const html = buildReceiptHtml(order)
  const win = window.open('', '_blank', 'width=420,height=650')
  if (win) {
    win.document.write(html)
    win.document.close()
  } else {
    console.warn('[WaiterReceipts] Popup blocked — falling back to HTML download')
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${order.id.slice(-8).toUpperCase()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }
}

function downloadReceipt(order: BackendOrder) {
  console.log('[WaiterReceipts] Downloading receipt for order:', order.id)
  const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total
  const subtotal = total / 1.2
  const vat = total - subtotal
  const lines = [
    'STEAKZ UK — Receipt',
    `Order: #${order.id.slice(-8).toUpperCase()}`,
    `Date: ${new Date(order.createdAt).toLocaleString('en-GB')}`,
    `Table: ${order.table?.tableNumber ?? '?'}`,
    '---',
    ...order.items.map((i) => {
      const price = typeof i.unitPrice === 'string' ? parseFloat(i.unitPrice) : (i.unitPrice ?? 0)
      return `${i.quantity}x ${i.menuItem?.name ?? 'Item'} — £${(price * i.quantity).toFixed(2)}`
    }),
    '---',
    `Subtotal: £${subtotal.toFixed(2)}`,
    `VAT (20%): £${vat.toFixed(2)}`,
    `TOTAL: £${total.toFixed(2)}`,
    '',
    'Thank you for dining with STEAKZ!',
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `receipt-${order.id.slice(-8).toUpperCase()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export function WaiterReceiptsPage() {
  const [search, setSearch] = useState('')
  const [previewOrder, setPreviewOrder] = useState<BackendOrder | null>(null)

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders', 'receipts'],
    queryFn: () => {
      console.log('[WaiterReceipts] Fetching all orders from backend (filter client-side)')
      return orderService.getOrders()
    },
    refetchInterval: 15_000,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const receipts = orders.filter((r: BackendOrder) => ['SERVED', 'COMPLETED', 'PAID', 'DELIVERED'].includes(r.status))
  console.log('[WaiterReceipts] Total orders:', orders.length, '| Receipts (paid/served):', receipts.length)

  const filtered = receipts.filter((r: BackendOrder) => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.id.toLowerCase().includes(q) || `table ${r.table?.tableNumber ?? ''}`.toLowerCase().includes(q)
  })

  const totalAmount = filtered.reduce((s: number, r: BackendOrder) => {
    const total = typeof r.total === 'string' ? parseFloat(r.total) : r.total
    return s + total
  }, 0)

  return (
    <div>
      <PageHeader title="Receipts" subtitle="Completed and paid orders — live from PostgreSQL" />

      {error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Could not load receipts. Check the backend server is running.</p>
        </div>
      ) : null}

      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by table or order ID..." className="max-w-xs" />
      </div>

      {isLoading ? <SkeletonList items={5} /> : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-beige">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Order ID</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Table</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Time</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Items</th>
                <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">Total</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r: BackendOrder) => {
                const total = typeof r.total === 'string' ? parseFloat(r.total) : r.total
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">#{r.id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 font-medium text-maroon">Table {r.table?.tableNumber ?? '?'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(r.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.items.length} item{r.items.length !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-3 text-right font-semibold text-maroon">{formatCurrency(total)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setPreviewOrder(r)}
                          title="View receipt"
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-maroon transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => printReceipt(r)}
                          title="Print receipt"
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-maroon transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadReceipt(r)}
                          title="Download receipt"
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-maroon transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    {receipts.length === 0 ? 'No completed or paid orders yet' : 'No receipts match your search'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="border-t border-gray-100 px-4 py-3 flex justify-between text-sm">
            <span className="text-gray-500">{filtered.length} receipt{filtered.length !== 1 ? 's' : ''} · Live from PostgreSQL</span>
            <span className="font-bold text-maroon">{formatCurrency(totalAmount)} total</span>
          </div>
        </div>
      )}

      {/* Receipt preview modal */}
      {previewOrder && (() => {
        const total = typeof previewOrder.total === 'string' ? parseFloat(previewOrder.total) : previewOrder.total
        const subtotal = total / 1.2
        const vat = total - subtotal
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
              <div className="bg-maroon text-white p-4 flex justify-between items-center">
                <h3 className="font-semibold">Receipt Preview</h3>
                <button onClick={() => setPreviewOrder(null)} className="text-white/70 hover:text-white text-lg leading-none">✕</button>
              </div>
              <div className="p-6 font-mono text-sm max-h-96 overflow-y-auto">
                <div className="text-center mb-4">
                  <div className="font-bold text-lg tracking-widest">STEAKZ UK</div>
                  {previewOrder.branch?.name && <div className="text-gray-500 text-xs">{previewOrder.branch.name}</div>}
                </div>
                <div className="border-t border-dashed border-gray-300 py-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Order:</span>
                    <span>#{previewOrder.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Table:</span>
                    <span>Table {previewOrder.table?.tableNumber ?? '?'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Date:</span>
                    <span>{new Date(previewOrder.createdAt).toLocaleString('en-GB')}</span>
                  </div>
                </div>
                <div className="border-t border-dashed border-gray-300 pt-3">
                  {previewOrder.items.map(i => {
                    const price = typeof i.unitPrice === 'string' ? parseFloat(i.unitPrice) : (i.unitPrice ?? 0)
                    return (
                      <div key={i.id} className="flex justify-between mb-2">
                        <span>{i.quantity}× {i.menuItem?.name ?? 'Item'}</span>
                        <span>£{(price * i.quantity).toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-dashed border-gray-300 pt-3 space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span><span>£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>VAT (20%)</span><span>£{vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-1">
                    <span>TOTAL</span><span>£{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 p-4 flex gap-3">
                <button
                  onClick={() => { printReceipt(previewOrder); setPreviewOrder(null) }}
                  className="flex-1 flex items-center justify-center gap-2 bg-maroon text-white py-2.5 rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={() => { downloadReceipt(previewOrder); setPreviewOrder(null) }}
                  className="flex-1 flex items-center justify-center gap-2 border border-maroon text-maroon py-2.5 rounded-lg text-sm font-medium hover:bg-beige transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
