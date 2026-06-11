import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { CreditCard, Banknote, Smartphone, ArrowLeft, CheckCircle, Lock } from 'lucide-react'
import { useBasketStore, selectSubtotal, selectBranchId, selectBranchName } from '@/stores/basket.store'
import { useAuth } from '@/hooks/useAuth'
import { AuthGate } from '@/components/ui/AuthGate'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { STATIC_BRANCHES } from '@/constants/nav'
import apiClient from '@/lib/axios'

type PayWhen = 'online' | 'restaurant'
type OnlineMethod = 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY'
type RestaurantMethod = 'CASH' | 'CARD'
type OrderType = 'DINE_IN' | 'TAKEAWAY'

const ONLINE_METHODS = [
  { id: 'CARD' as OnlineMethod, label: 'Credit / Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
  { id: 'APPLE_PAY' as OnlineMethod, label: 'Apple Pay', icon: Smartphone, description: 'Pay with Touch ID or Face ID' },
  { id: 'GOOGLE_PAY' as OnlineMethod, label: 'Google Pay', icon: Smartphone, description: 'Pay with your Google account' },
]

const RESTAURANT_METHODS = [
  { id: 'CASH' as RestaurantMethod, label: 'Cash', icon: Banknote, description: 'Pay in cash when you arrive' },
  { id: 'CARD' as RestaurantMethod, label: 'Card at Table', icon: CreditCard, description: 'Chip & PIN or contactless' },
]

const VAT_RATE = 0.2

export function CheckoutPage() {
  const { isAuthenticated, user, canPlaceOrders } = useAuth()
  const { items, clearBasket } = useBasketStore()
  const subtotal = useBasketStore(selectSubtotal)
  const basketBranchId = useBasketStore(selectBranchId)
  const basketBranchName = useBasketStore(selectBranchName)
  const setBranch = useBasketStore(s => s.setBranch)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const [orderType, setOrderType] = useState<OrderType | null>(null)
  const [payWhen, setPayWhen] = useState<PayWhen>('online')
  const [onlineMethod, setOnlineMethod] = useState<OnlineMethod | null>(null)
  const [restaurantMethod, setRestaurantMethod] = useState<RestaurantMethod | null>(null)
  const [placing, setPlacing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')

  const tax = subtotal * VAT_RATE
  const total = subtotal + tax

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4">
        <div className="text-center mb-4">
          <Lock className="w-10 h-10 text-maroon/30 mx-auto mb-3" />
          <h1 className="font-serif font-bold text-2xl text-maroon mb-1">Checkout</h1>
          <p className="text-gray-500 text-sm">You need to be signed in to place an order.</p>
        </div>
        <AuthGate
          title="Sign in to complete your order"
          description="Create a free account to place orders, make payments, and track your dining experience."
          from="/checkout"
        />
      </div>
    )
  }

  if (isAuthenticated && !canPlaceOrders) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4">
        <div className="text-center mb-6">
          <Lock className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h1 className="font-serif font-bold text-2xl text-maroon mb-2">Ordering not available</h1>
          <p className="text-gray-600 max-w-sm mx-auto">
            Only customers or waiters can place orders. Please sign in with a customer account to order, or speak to a member of staff who can take your order at the table.
          </p>
        </div>
        <div className="text-center">
          <Link to="/basket" className="inline-flex items-center gap-2 text-sm text-maroon hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Basket
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="font-serif font-bold text-2xl text-maroon mb-2">Your basket is empty</h2>
        <Link to="/menu" className="text-maroon hover:underline text-sm">Browse Menu</Link>
      </div>
    )
  }

  async function handlePlaceOrder() {
    if (!basketBranchId) {
      toast({ title: 'Please select a branch', description: 'Choose which STEAKZ branch your order is for.', variant: 'destructive' })
      return
    }
    if (!orderType) {
      toast({ title: 'Please select Dine In or Takeaway', variant: 'destructive' })
      return
    }
    const selectedMethod = payWhen === 'online' ? onlineMethod : restaurantMethod
    if (!selectedMethod) {
      toast({ title: 'Please select a payment method', variant: 'destructive' })
      return
    }

    const branchId = basketBranchId

    console.log('[Checkout] Placing order:', {
      items: items.map(i => ({ menuItemId: i.menuItem.id, name: i.menuItem.name, quantity: i.quantity })),
      branchId,
      orderType,
      paymentMethod: selectedMethod,
      payWhen,
      total,
    })

    setPlacing(true)
    try {
      const orderItems = items.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
      }))

      const response = await apiClient.post('/orders/customer', {
        branchId,
        orderType,
        items: orderItems,
        paymentMethod: selectedMethod,
        payWhen,
      })

      console.log('[Checkout] ORDER SAVED:', response.data)
      console.log('[AUDIT] ORDER_PLACED user:', user?.id, '| total:', total, '| branchId:', branchId, '| orderType:', orderType)

      const savedOrder = response.data.order

      // Create a payment record for online payments so revenue is tracked
      if (payWhen === 'online' && savedOrder?.id) {
        const backendMethod = (onlineMethod === 'APPLE_PAY' || onlineMethod === 'GOOGLE_PAY') ? 'CONTACTLESS' : 'CARD'
        try {
          await apiClient.post('/payments', { orderId: savedOrder.id, method: backendMethod })
          console.log('[Checkout] Payment record created for order:', savedOrder.id, '| method:', backendMethod)
        } catch (payErr) {
          console.warn('[Checkout] Payment record creation failed (non-fatal):', payErr)
        }
      }

      clearBasket()

      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['orders', 'my'] })
      qc.invalidateQueries({ queryKey: ['hq-dashboard'] })
      qc.invalidateQueries({ queryKey: ['revenue-trend'] })

      toast({
        title: 'Order placed successfully!',
        description: `Order #${savedOrder?.id?.slice(-8)?.toUpperCase() ?? 'SAVED'}`,
        variant: 'success',
      })
      navigate('/customer/orders')
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string; outOfStockItems?: string[] } }; message?: string }
      console.error('[Checkout] ORDER FAILED:', err)
      const outOfStockItems: string[] = error?.response?.data?.outOfStockItems ?? []
      if (outOfStockItems.length > 0) {
        console.warn('[Checkout] Out of stock items:', outOfStockItems)
        toast({
          title: 'Some items in your basket are out of stock',
          description: `${outOfStockItems.join(', ')} — please remove them before placing your order.`,
          variant: 'destructive',
        })
        navigate('/basket', { state: { outOfStockItems } })
      } else if (error?.response?.status === 403) {
        toast({
          title: 'Access denied',
          description: error?.response?.data?.message ?? 'Orders can only be placed by customers or waiters.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Could not place order',
          description: error?.response?.data?.message ?? error?.message ?? 'Please try again.',
          variant: 'destructive',
        })
      }
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/basket" className="text-gray-400 hover:text-maroon transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif font-bold text-3xl text-maroon">Checkout</h1>
          <p className="text-gray-500 text-sm">Signed in as {user?.firstName} {user?.lastName}</p>
        </div>
      </div>

      {/* Branch selector — required before placing order */}
      {!basketBranchId ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-amber-800 mb-1">Select Your Branch</h3>
          <p className="text-sm text-amber-600 mb-4">Choose which STEAKZ branch your order is for.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STATIC_BRANCHES.map(b => (
              <button key={b.id} onClick={() => setBranch(b.id, b.name)}
                className="p-3 rounded-lg border-2 border-amber-200 hover:border-maroon bg-white text-left transition-colors">
                <div className="font-semibold text-sm text-gray-800">{b.name}</div>
                <div className="text-xs text-gray-500">{b.city}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex justify-between items-center">
          <span className="text-sm text-green-800 font-medium">📍 {basketBranchName ?? basketBranchId}</span>
          <button onClick={() => setBranch('', '')} className="text-xs text-green-600 hover:underline">Change</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Payment section */}
        <div className="lg:col-span-3 space-y-6">

          {/* Dine In vs Takeaway */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-serif font-bold text-maroon text-lg mb-4">How would you like to order?</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setOrderType('DINE_IN')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${orderType === 'DINE_IN' ? 'border-maroon bg-beige' : 'border-gray-200 hover:border-gray-300'}`}>
                <p className={`font-semibold text-sm ${orderType === 'DINE_IN' ? 'text-maroon' : 'text-gray-700'}`}>🍽️ Dine In</p>
                <p className="text-xs text-gray-400 mt-0.5">Eat at the restaurant</p>
              </button>
              <button onClick={() => setOrderType('TAKEAWAY')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${orderType === 'TAKEAWAY' ? 'border-maroon bg-beige' : 'border-gray-200 hover:border-gray-300'}`}>
                <p className={`font-semibold text-sm ${orderType === 'TAKEAWAY' ? 'text-maroon' : 'text-gray-700'}`}>🥡 Takeaway</p>
                <p className="text-xs text-gray-400 mt-0.5">Collect your order</p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-serif font-bold text-maroon text-lg mb-4">When would you like to pay?</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'online' as PayWhen, label: 'Pay Online Now', sub: 'Secure payment today' },
                { id: 'restaurant' as PayWhen, label: 'Pay at Restaurant', sub: 'Pay when you visit' },
              ].map((opt) => (
                <button key={opt.id} onClick={() => setPayWhen(opt.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${payWhen === opt.id ? 'border-maroon bg-beige' : 'border-gray-200 hover:border-gray-300'}`}>
                  <p className={`font-medium text-sm ${payWhen === opt.id ? 'text-maroon' : 'text-gray-700'}`}>{opt.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-serif font-bold text-maroon text-lg mb-4">Payment Method</h3>

            {payWhen === 'online' && (
              <div className="space-y-3">
                {ONLINE_METHODS.map(({ id, label, icon: Icon, description }) => (
                  <button key={id} onClick={() => setOnlineMethod(id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${onlineMethod === id ? 'border-maroon bg-beige' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${onlineMethod === id ? 'bg-maroon text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${onlineMethod === id ? 'text-maroon' : 'text-gray-700'}`}>{label}</p>
                      <p className="text-xs text-gray-400">{description}</p>
                    </div>
                    {onlineMethod === id && <CheckCircle className="w-5 h-5 text-maroon ml-auto" />}
                  </button>
                ))}
                {onlineMethod === 'CARD' && (
                  <div className="mt-4 space-y-3 p-4 bg-beige rounded-xl">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name on Card</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith"
                        className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Card Number</label>
                      <input value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                        placeholder="1234 5678 9012 3456"
                        className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-maroon" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Expiry</label>
                        <input value={expiry}
                          onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setExpiry(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v) }}
                          placeholder="MM/YY"
                          className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-maroon" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
                        <input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123"
                          className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-maroon" />
                      </div>
                    </div>
                  </div>
                )}
                {(onlineMethod === 'APPLE_PAY' || onlineMethod === 'GOOGLE_PAY') && (
                  <div className="mt-3 p-4 bg-beige rounded-xl text-center text-sm text-gray-500">
                    You'll be redirected to {onlineMethod === 'APPLE_PAY' ? 'Apple Pay' : 'Google Pay'} to complete payment.
                  </div>
                )}
              </div>
            )}

            {payWhen === 'restaurant' && (
              <div className="space-y-3">
                {RESTAURANT_METHODS.map(({ id, label, icon: Icon, description }) => (
                  <button key={id} onClick={() => setRestaurantMethod(id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${restaurantMethod === id ? 'border-maroon bg-beige' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${restaurantMethod === id ? 'bg-maroon text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${restaurantMethod === id ? 'text-maroon' : 'text-gray-700'}`}>{label}</p>
                      <p className="text-xs text-gray-400">{description}</p>
                    </div>
                    {restaurantMethod === id && <CheckCircle className="w-5 h-5 text-maroon ml-auto" />}
                  </button>
                ))}
                <div className="mt-2 p-3 bg-beige rounded-lg text-xs text-gray-500">
                  Your order will be confirmed. Please show your order number at reception.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h3 className="font-serif font-bold text-maroon text-lg mb-5">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.menuItem.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-beige">
                    {item.menuItem.imageUrl ? (
                      <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-base">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 font-medium truncate">{item.menuItem.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{formatCurrency(item.menuItem.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>VAT (20%)</span><span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-maroon text-lg border-t border-gray-100 pt-3 mt-1">
                <span>Total</span><span>{formatCurrency(total)}</span>
              </div>
            </div>
            {!orderType && (
              <p className="mt-3 text-xs text-amber-600 text-center bg-amber-50 rounded-lg px-3 py-2">
                Select Dine In or Takeaway to continue.
              </p>
            )}
            {orderType && !onlineMethod && payWhen === 'online' && (
              <p className="mt-3 text-xs text-amber-600 text-center bg-amber-50 rounded-lg px-3 py-2">
                Please select a payment method above.
              </p>
            )}
            {orderType && !restaurantMethod && payWhen === 'restaurant' && (
              <p className="mt-3 text-xs text-amber-600 text-center bg-amber-50 rounded-lg px-3 py-2">
                Please select how you would like to pay at the restaurant.
              </p>
            )}
            <button onClick={handlePlaceOrder}
              disabled={placing || !basketBranchId || !orderType || (payWhen === 'online' ? !onlineMethod : !restaurantMethod)}
              className="mt-4 w-full bg-maroon text-white py-3.5 rounded-xl font-medium hover:bg-maroon-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {placing
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Lock className="w-4 h-4" />{payWhen === 'online' ? `Pay ${formatCurrency(total)}` : 'Place Order'}</>}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Secured with 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
