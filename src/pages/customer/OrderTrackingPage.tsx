import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Clock, ChefHat, UtensilsCrossed, CreditCard, Package } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const STEPS: { status: OrderStatus; label: string; description: string; icon: React.ElementType }[] = [
  { status: 'PENDING', label: 'Order Received', description: 'Your order has been received by the restaurant.', icon: Package },
  { status: 'PREPARING', label: 'Preparing', description: 'The kitchen is preparing your order.', icon: ChefHat },
  { status: 'READY', label: 'Ready', description: 'Your order is ready to be served.', icon: CheckCircle },
  { status: 'SERVED', label: 'Served', description: 'Your order has been brought to your table.', icon: UtensilsCrossed },
  { status: 'PAID', label: 'Paid', description: 'Payment has been processed. Enjoy your meal!', icon: CreditCard },
]

const STATUS_ORDER: OrderStatus[] = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'PAID']

// Demo auto-advance simulation
function useMockTracking(orderId: string) {
  const [status, setStatus] = useState<OrderStatus>('PENDING')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!orderId) return
    const tick = setInterval(() => {
      setElapsed((e) => e + 1)
      setStatus((prev) => {
        const idx = STATUS_ORDER.indexOf(prev)
        if (idx < STATUS_ORDER.length - 1 && Math.random() < 0.08) {
          return STATUS_ORDER[idx + 1]
        }
        return prev
      })
    }, 3000)
    return () => clearInterval(tick)
  }, [orderId])

  return { status, elapsed }
}

// Demo order
const DEMO_ORDER = {
  id: 'ORD-20260001',
  tableNumber: 4,
  branchName: 'STEAKZ Mayfair',
  items: [
    { name: 'Sirloin Steak', quantity: 2, price: 28.95 },
    { name: 'Loaded Fries', quantity: 1, price: 7.95 },
    { name: 'House Red Wine', quantity: 2, price: 8.50 },
  ],
  subtotal: 82.85,
  tax: 16.57,
  total: 99.42,
  createdAt: new Date().toISOString(),
  paymentMethod: 'CARD',
}

export function OrderTrackingPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order') || DEMO_ORDER.id
  const { status, elapsed } = useMockTracking(orderId)

  const currentStep = STATUS_ORDER.indexOf(status)

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <PageHeader
        title="Order Tracking"
        subtitle={`Order ${orderId} • ${DEMO_ORDER.branchName}`}
      />

      {/* Status banner */}
      <div className={`rounded-2xl p-5 mb-8 text-white text-center ${
        status === 'PAID' ? 'bg-green-600' : status === 'READY' ? 'bg-maroon' : 'bg-maroon'
      }`}>
        <div className="flex items-center justify-center gap-2 mb-1">
          {status !== 'PAID' && (
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          )}
          <p className="font-serif font-bold text-xl">
            {STEPS.find((s) => s.status === status)?.label}
          </p>
        </div>
        <p className="text-white/80 text-sm">
          {STEPS.find((s) => s.status === status)?.description}
        </p>
        <p className="text-white/60 text-xs mt-1">
          {status !== 'PAID' ? `Auto-refreshing • ${elapsed}s` : 'Thank you for dining with us!'}
        </p>
      </div>

      {/* Progress steps */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
          <div
            className="absolute left-5 top-5 w-0.5 bg-maroon transition-all duration-700"
            style={{ height: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />

          <div className="space-y-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon
              const isCompleted = idx < currentStep
              const isCurrent = idx === currentStep
              return (
                <div key={step.status} className="flex items-start gap-4 relative">
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    isCompleted ? 'bg-maroon' : isCurrent ? 'bg-maroon ring-4 ring-maroon/20' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${isCompleted || isCurrent ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="pt-1.5">
                    <p className={`font-medium ${isCompleted || isCurrent ? 'text-maroon' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                    {isCurrent && status !== 'PAID' && (
                      <span className="inline-flex items-center gap-1 text-xs text-gold font-medium mt-1">
                        <Clock className="w-3 h-3" /> In progress…
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-serif font-bold text-maroon mb-4">Order Summary</h3>
        <div className="space-y-2 mb-4">
          {DEMO_ORDER.items.map((item) => (
            <div key={item.name} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.quantity}× {item.name}</span>
              <span className="text-gray-600">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-1">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span><span>{formatCurrency(DEMO_ORDER.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>VAT (20%)</span><span>{formatCurrency(DEMO_ORDER.tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-maroon">
            <span>Total</span><span>{formatCurrency(DEMO_ORDER.total)}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
          <span>Placed: {formatDateTime(DEMO_ORDER.createdAt)}</span>
          <span>Table {DEMO_ORDER.tableNumber} • {DEMO_ORDER.paymentMethod}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Link to="/menu" className="flex-1 text-center border border-maroon text-maroon py-3 rounded-xl text-sm font-medium hover:bg-beige transition-colors">
          Order More
        </Link>
        <Link to="/customer/orders" className="flex-1 text-center bg-maroon text-white py-3 rounded-xl text-sm font-medium hover:bg-maroon-dark transition-colors">
          View All Orders
        </Link>
      </div>
    </div>
  )
}
