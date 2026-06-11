export type InventoryUnit = 'KG' | 'LITRE' | 'UNIT' | 'PORTION' | 'BOX'
export type StockLevel = 'CRITICAL' | 'LOW' | 'NORMAL' | 'HIGH'

export interface InventoryItem {
  id: string
  name: string
  category: string
  branchId: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: InventoryUnit
  unitCost: number
  supplier?: string
  stockLevel: StockLevel
  lastRestocked?: string
}

export interface InventoryFilters {
  category?: string
  branchId?: string
  stockLevel?: StockLevel
  search?: string
  page?: number
  limit?: number
}

export interface UpdateInventoryData {
  currentStock?: number
  minStock?: number
  maxStock?: number
  unitCost?: number
  supplier?: string
}
