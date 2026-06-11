import { formatCurrency, formatDateTime, generateReceiptNumber } from '@/lib/utils'
import type { Order, OrderItem } from '@/types'

function resolveItemPrice(item: OrderItem): number {
  if (item.unitPrice !== undefined) {
    return typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice
  }
  return item.price
}

interface ReceiptDocumentProps {
  order: Order
  branchName?: string
  branchAddress?: string
}

export function ReceiptDocument({ order, branchName = 'STEAKZ Mayfair', branchAddress = '12 Berkeley Square, London W1J 6EQ' }: ReceiptDocumentProps) {
  const receiptNumber = generateReceiptNumber()

  return (
    <div className="w-80 mx-auto bg-white p-6 font-mono text-sm border border-dashed border-gray-300 rounded">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold tracking-wider">STEAKZ UK</h1>
        <p className="text-gray-600 text-xs">{branchName}</p>
        <p className="text-gray-500 text-xs">{branchAddress}</p>
        <p className="text-gray-500 text-xs">Tel: 020 7946 0001</p>
      </div>

      <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Receipt No:</span>
          <span>{receiptNumber}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Date:</span>
          <span>{formatDateTime(order.createdAt)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Table:</span>
          <span>T{order.tableNumber || 1}</span>
        </div>
        {order.waiterName && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Served by:</span>
            <span>{order.waiterName}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
        <p className="font-bold mb-2">ITEMS</p>
        {order.items.map((item) => (
          <div key={item.id} className="mb-2">
            <div className="flex justify-between">
              <span className="flex-1 pr-2">{item.menuItem.name}</span>
              <span>{formatCurrency(resolveItemPrice(item) * item.quantity)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{item.quantity}x @ {formatCurrency(resolveItemPrice(item))}</span>
              {item.cookingPreference && <span>{item.cookingPreference}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-300 pt-4 mb-4 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>VAT (20%)</span>
          <span>{formatCurrency(order.tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-2 mt-2">
          <span>TOTAL</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
        {order.paymentMethod && (
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Payment Method</span>
            <span>{order.paymentMethod}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-gray-300 pt-4 text-center">
        <p className="text-xs text-gray-500">Thank you for dining with us.</p>
        <p className="text-xs text-gray-500">We hope to see you again soon.</p>
        <p className="text-xs text-gray-400 mt-2">www.steakz.co.uk</p>
      </div>
    </div>
  )
}
