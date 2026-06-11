import apiClient from '@/lib/axios'
import { useAuthStore } from '@/stores/auth.store'

function branchParam(): Record<string, string> {
  const user = useAuthStore.getState().user
  const params: Record<string, string> = user?.branchId ? { branchId: user.branchId } : {}
  console.log('[BranchParam/Orders] role:', user?.role, '| branchId:', user?.branchId ?? 'NONE (global role)')
  if (!params.branchId && user?.role !== 'ADMIN' && user?.role !== 'HQ_MANAGER' && user?.role !== 'CUSTOMER' && user?.role) {
    console.warn('[BranchParam/Orders] WARNING: branch staff has no branchId — data isolation at risk!')
  }
  return params
}

export interface BackendOrderItem {
  id: string
  menuItemId: string
  quantity: number
  unitPrice: number | string
  menuItem: { id: string; name: string; price: number | string }
}

export interface BackendOrder {
  id: string
  branchId: string
  tableId: string
  waiterId: string
  status: string
  total: number | string
  createdAt: string
  updatedAt: string
  items: BackendOrderItem[]
  table?: { id: string; tableNumber: number } | null
  waiter?: { id: string; firstName: string; lastName: string }
  customer?: { id: string; firstName: string; lastName: string }
  branch?: { id: string; name: string }
}

export const orderService = {
  async getLiveOrders(params?: Record<string, string>): Promise<BackendOrder[]> {
    const { data } = await apiClient.get<{ success: boolean; orders: BackendOrder[] }>(
      '/orders/live',
      { params: { ...branchParam(), ...params } }
    )
    const orders = data.orders ?? []
    console.log('[Orders] getLiveOrders — received', orders.length, 'live orders')
    console.log('[Orders] Status breakdown:', orders.reduce((acc: Record<string, number>, o: BackendOrder) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1; return acc
    }, {}))
    return orders
  },

  async getOrders(params?: Record<string, string>): Promise<BackendOrder[]> {
    const user = useAuthStore.getState().user
    console.log('[BranchIsolation] Fetching orders — role:', user?.role ?? 'guest', '| branchId:', user?.branchId ?? 'ALL')
    const { data } = await apiClient.get<{ success: boolean; orders: BackendOrder[] }>(
      '/orders',
      { params: { ...branchParam(), ...params } }
    )
    console.log('[Orders] getOrders — received', (data.orders ?? []).length, 'orders')
    return data.orders ?? []
  },

  async updateOrderStatus(id: string, status: string): Promise<BackendOrder> {
    console.log('[Orders] updateOrderStatus — order:', id, '→ status:', status)
    const { data } = await apiClient.patch<{ success: boolean; order: BackendOrder }>(
      `/orders/${id}/status`,
      { status }
    )
    return data.order
  },

  async createOrder(body: { tableId: string; items: Array<{ menuItemId: string; quantity: number }> }): Promise<BackendOrder> {
    console.log('[Orders] createOrder — tableId:', body.tableId, '| items:', body.items.length)
    const { data } = await apiClient.post<{ success: boolean; order: BackendOrder }>(
      '/orders',
      body
    )
    return data.order
  },

  async createCustomerOrder(body: { branchId: string; items: Array<{ menuItemId: string; quantity: number }>; paymentMethod: string; payWhen: string }): Promise<BackendOrder> {
    console.log('[Orders] createCustomerOrder — branchId:', body.branchId, '| items:', body.items.length, '| paymentMethod:', body.paymentMethod)
    const { data } = await apiClient.post<{ success: boolean; order: BackendOrder }>(
      '/orders/customer',
      body
    )
    console.log('[Orders] createCustomerOrder response:', data)
    return data.order
  },
}
