import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react'
import { useBasketStore, selectSubtotal } from '@/stores/basket.store'
import { useAuth } from '@/hooks/useAuth'
import { AuthGate } from '@/components/ui/AuthGate'
import { formatCurrency } from '@/lib/utils'

const VAT_RATE = 0.2

export function BasketPage() {
  const { isAuthenticated, canPlaceOrders } = useAuth()
  const { items, updateQuantity, removeItem, clearBasket } = useBasketStore()
  const subtotal = useBasketStore(selectSubtotal)
  const navigate = useNavigate()
  const location = useLocation()
  const outOfStockItems: string[] = (location.state as { outOfStockItems?: string[] } | null)?.outOfStockItems ?? []

  // Require login to use basket
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <div className="text-center mb-4">
          <ShoppingBag className="w-10 h-10 text-maroon/30 mx-auto mb-3" />
          <h1 className="font-serif font-bold text-2xl text-maroon mb-1">Your Basket</h1>
          <p className="text-gray-500 text-sm">Sign in to create a basket and place orders.</p>
        </div>
        <AuthGate
          title="Sign in to access your basket"
          description="Create a free account to add dishes to your basket, place orders, and track deliveries."
          from="/basket"
        />
      </div>
    )
  }

  if (isAuthenticated && !canPlaceOrders) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <div className="text-center mb-6">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h1 className="font-serif font-bold text-2xl text-maroon mb-2">Ordering not available</h1>
          <p className="text-gray-600 max-w-sm mx-auto">
            Only customers or waiters can place orders. Please sign in with a customer account to order, or speak to a member of staff who can take your order at the table.
          </p>
        </div>
        <div className="text-center">
          <Link to="/menu" className="inline-flex items-center gap-2 text-sm text-maroon hover:underline">
            <ArrowLeft className="w-4 h-4" /> Browse Menu
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-beige flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-10 h-10 text-maroon/40" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-maroon mb-2">Your basket is empty</h2>
        <p className="text-gray-500 mb-8">Browse our menu and add some items to get started.</p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 bg-maroon text-white px-6 py-3 rounded-xl font-medium hover:bg-maroon-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Browse Menu
        </Link>
      </div>
    )
  }

  const tax = subtotal * VAT_RATE
  const total = subtotal + tax

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-maroon transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-serif font-bold text-3xl text-maroon">Your Basket</h1>
          <p className="text-gray-500 text-sm">{items.reduce((s, i) => s + i.quantity, 0)} items</p>
        </div>
      </div>

      {outOfStockItems.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Some items in your basket are out of stock.</p>
            <p className="text-red-700 text-sm mt-1">
              Please remove the following before placing your order:{' '}
              <strong>{outOfStockItems.join(', ')}</strong>.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.menuItem.id}-${item.cookingPreference}`} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-beige flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.menuItem.imageUrl ? (
                    <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-maroon text-lg">
                      {item.menuItem.category === 'STEAKS' ? '🥩'
                        : item.menuItem.category === 'STARTERS' ? '🍽️'
                        : item.menuItem.category === 'DESSERTS' ? '🍮'
                        : item.menuItem.category === 'DRINKS' ? '🥂'
                        : '🍔'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">{item.menuItem.name}</p>
                      {item.cookingPreference && <p className="text-xs text-gray-400 mt-0.5">{item.cookingPreference}</p>}
                      <p className="text-xs text-gray-400 capitalize">{item.menuItem.category.toLowerCase()}</p>
                    </div>
                    <button onClick={() => removeItem(item.menuItem.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-maroon hover:text-maroon transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-maroon hover:text-maroon transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{formatCurrency(item.menuItem.price * 1.2)} each inc. VAT</p>
                      <p className="font-bold text-maroon">{formatCurrency(item.menuItem.price * 1.2 * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearBasket} className="text-sm text-red-400 hover:text-red-600 transition-colors flex items-center gap-1">
            <Trash2 className="w-4 h-4" /> Clear basket
          </button>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h3 className="font-serif font-bold text-maroon text-lg mb-5">Order Summary</h3>
            <div className="space-y-2 mb-5">
              {items.map((item) => (
                <div key={item.menuItem.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.quantity}× {item.menuItem.name}</span>
                  <span className="text-gray-700 font-medium">{formatCurrency(item.menuItem.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>VAT (20%)</span><span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-maroon text-lg border-t border-gray-100 pt-3 mt-2">
                <span>Total</span><span>{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Link to="/checkout" className="block w-full text-center bg-maroon text-white py-3 rounded-xl font-medium hover:bg-maroon-dark transition-colors">
                Proceed to Checkout
              </Link>
              <Link to="/menu" className="block w-full text-center border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:border-maroon hover:text-maroon transition-colors">
                Continue Shopping
              </Link>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">Service charge may apply at the restaurant.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
