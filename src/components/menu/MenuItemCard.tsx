import { useState } from 'react'
import { ShoppingBag, ChefHat } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { MenuItem } from '@/types'

interface MenuItemCardProps {
  item: MenuItem
  onAddToOrder?: (item: MenuItem, cookingPreference?: string) => void
  showOrderButton?: boolean
  basketMode?: boolean
  inventoryStatus?: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK'
  orderPermissionMessage?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  STARTERS: 'bg-green-100 text-green-700',
  STEAKS: 'bg-red-100 text-red-700',
  MAINS: 'bg-orange-100 text-orange-700',
  DESSERTS: 'bg-pink-100 text-pink-700',
  DRINKS: 'bg-blue-100 text-blue-700',
}

const CATEGORY_LABELS: Record<string, string> = {
  STARTERS: 'Starter',
  STEAKS: 'Steak',
  MAINS: 'Main',
  DESSERTS: 'Dessert',
  DRINKS: 'Drink',
}

export function MenuItemCard({ item, onAddToOrder, showOrderButton = false, basketMode = false, inventoryStatus, orderPermissionMessage }: MenuItemCardProps) {
  const [selectedCooking, setSelectedCooking] = useState<string>('')
  const [imgError, setImgError] = useState(false)

  function handleAdd() {
    if (onAddToOrder) {
      onAddToOrder(item, selectedCooking || undefined)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="h-48 relative overflow-hidden">
        {item.imageUrl && !imgError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-maroon/10 to-beige flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-maroon/30" />
          </div>
        )}
        {/* Category badge */}
        <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-600'}`}>
          {CATEGORY_LABELS[item.category] || item.category}
        </span>
        {/* Unavailable / Out of Stock overlay */}
        {(!item.isAvailable || inventoryStatus === 'OUT_OF_STOCK') && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow">
              {inventoryStatus === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Unavailable'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-serif font-semibold text-maroon leading-tight">{item.name}</h3>
            {inventoryStatus === 'LOW_STOCK' && (
              <span className="inline-block text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full mt-1">
                Low Stock
              </span>
            )}
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-gold font-semibold text-lg">{formatCurrency(item.price * 1.2)}</span>
            <span className="text-xs text-gray-400">inc. VAT</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">{item.description}</p>

        {item.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.allergens.map((a) => (
              <span key={a} className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-100 px-1.5 py-0.5 rounded capitalize">
                {a}
              </span>
            ))}
          </div>
        )}

        {item.cookingOptions && item.cookingOptions.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1.5">Cooking preference:</p>
            <div className="flex flex-wrap gap-1.5">
              {item.cookingOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedCooking(opt === selectedCooking ? '' : opt)}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                    selectedCooking === opt
                      ? 'bg-maroon text-white border-maroon'
                      : 'border-gray-200 text-gray-600 hover:border-maroon hover:text-maroon'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {showOrderButton && item.isAvailable && inventoryStatus !== 'OUT_OF_STOCK' && !orderPermissionMessage && (
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 bg-maroon text-white py-2 rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors mt-2"
          >
            <ShoppingBag className="w-4 h-4" />
            {basketMode ? 'Add to Basket' : 'Add to Order'}
          </button>
        )}
        {showOrderButton && orderPermissionMessage && (
          <p className="mt-2 text-xs text-gray-400 text-center italic leading-snug" title={orderPermissionMessage}>
            {orderPermissionMessage}
          </p>
        )}
      </div>
    </div>
  )
}
