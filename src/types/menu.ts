export type MenuCategory = 'STARTERS' | 'STEAKS' | 'MAINS' | 'DESSERTS' | 'DRINKS'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: MenuCategory
  imageUrl?: string
  isAvailable: boolean
  allergens: string[]
  calories?: number
  cookingOptions?: string[]
  featured?: boolean
}

export interface MenuFilters {
  category?: MenuCategory
  search?: string
  featured?: boolean
  isAvailable?: boolean
  page?: number
  limit?: number
}

export interface CreateMenuItemData {
  name: string
  description: string
  price: number
  category: MenuCategory
  imageUrl?: string
  isAvailable: boolean
  allergens: string[]
  calories?: number
  cookingOptions?: string[]
}
