import apiClient from '@/lib/axios'
import { useAuthStore } from '@/stores/auth.store'

function branchParam(): Record<string, string> {
  const user = useAuthStore.getState().user
  const params: Record<string, string> = user?.branchId ? { branchId: user.branchId } : {}
  console.log(`[BranchSecurity/Inventory] Role: ${user?.role ?? 'guest'} | BranchId: ${user?.branchId ?? 'ALL (admin/hq)'}`)
  return params
}

export interface InventoryItem {
  id: string
  branchId: string
  name: string
  category?: string
  quantity: number
  minimumStock: number
  unit?: string
  createdAt: string
  updatedAt: string
  branch?: { id: string; name: string }
  transactions?: Array<{
    id: string
    quantity: number
    transactionType: 'IN' | 'OUT' | 'ADJUSTMENT'
    notes?: string
    createdAt: string
  }>
}

export const inventoryService = {
  async getInventory(params?: Record<string, string>): Promise<{ inventory: InventoryItem[]; lowStockCount: number; lowStock: InventoryItem[] }> {
    const { data } = await apiClient.get<{ success: boolean; inventory: InventoryItem[]; lowStockCount: number; lowStock: InventoryItem[] }>(
      '/inventory',
      { params: { ...branchParam(), ...params } }
    )
    const result = { inventory: data.inventory ?? [], lowStockCount: data.lowStockCount ?? 0, lowStock: data.lowStock ?? [] }
    console.log('[Inventory] getInventory — received', result.inventory.length, 'items |', result.lowStockCount, 'low stock')
    return result
  },

  async createInventoryItem(body: { name: string; quantity: number; minimumStock: number; unit?: string; branchId?: string }): Promise<InventoryItem> {
    console.log('[Inventory] createInventoryItem:', body.name)
    const { data } = await apiClient.post<{ success: boolean; inventoryItem: InventoryItem }>('/inventory', body)
    return data.inventoryItem
  },

  async updateInventoryItem(id: string, body: Partial<{ quantity: number; minimumStock: number; notes: string; transactionType: string }>): Promise<InventoryItem> {
    console.log('[Inventory] updateInventoryItem — id:', id, '| body:', body)
    const { data } = await apiClient.put<{ success: boolean; item: InventoryItem }>(`/inventory/${id}`, body)
    console.log('[Inventory] updateInventoryItem response:', data)
    return data.item
  },
}
