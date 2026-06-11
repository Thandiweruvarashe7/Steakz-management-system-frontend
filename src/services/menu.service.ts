import apiClient from '@/lib/axios'
import type { MenuItem, MenuCategory, CreateMenuItemData } from '@/types'

// Backend response shape for GET /menu
interface BackendCategory {
  id: string
  name: string
  items: Array<{
    id: string
    name: string
    description?: string
    price: number | string
    imageUrl?: string
    isAvailable: boolean
  }>
}

const CATEGORY_MAP: Record<string, MenuCategory> = {
  Starters:  'STARTERS',
  Steaks:    'STEAKS',
  Burgers:   'MAINS',
  Sides:     'STARTERS',
  Mains:     'MAINS',
  Desserts:  'DESSERTS',
  Drinks:    'DRINKS',
}

function flattenCategories(categories: BackendCategory[]): MenuItem[] {
  return categories.flatMap((cat) =>
    cat.items.map((item) => ({
      id:           item.id,
      name:         item.name,
      description:  item.description ?? '',
      price:        typeof item.price === 'string' ? parseFloat(item.price) : item.price,
      category:     (CATEGORY_MAP[cat.name] ?? 'MAINS') as MenuCategory,
      imageUrl:     item.imageUrl,
      isAvailable:  item.isAvailable,
      allergens:    [] as string[],
    }))
  )
}

export const menuService = {
  async getMenuItems(): Promise<MenuItem[]> {
    const { data } = await apiClient.get<{ success: boolean; categories: BackendCategory[] }>('/menu')
    return flattenCategories(data.categories)
  },

  async getMenuItemById(id: string): Promise<MenuItem> {
    const { data } = await apiClient.get<{ success: boolean; item: BackendCategory['items'][0] & { category: { id: string; name: string } } }>(`/menu/${id}`)
    const cat = data.item.category?.name ?? 'MAINS'
    return {
      id:          data.item.id,
      name:        data.item.name,
      description: data.item.description ?? '',
      price:       typeof data.item.price === 'string' ? parseFloat(data.item.price) : data.item.price,
      category:    (CATEGORY_MAP[cat] ?? 'MAINS') as MenuCategory,
      imageUrl:    data.item.imageUrl,
      isAvailable: data.item.isAvailable,
      allergens:   [],
    }
  },

  async createMenuItem(itemData: CreateMenuItemData): Promise<MenuItem> {
    const { data } = await apiClient.post<{ success: boolean; item: BackendCategory['items'][0] }>('/menu', itemData)
    return {
      id:          data.item.id,
      name:        data.item.name,
      description: data.item.description ?? '',
      price:       typeof data.item.price === 'string' ? parseFloat(data.item.price) : data.item.price,
      category:    'MAINS',
      imageUrl:    data.item.imageUrl,
      isAvailable: data.item.isAvailable,
      allergens:   [],
    }
  },

  async updateMenuItem(id: string, itemData: Partial<CreateMenuItemData>): Promise<MenuItem> {
    const { data } = await apiClient.put<{ success: boolean; item: BackendCategory['items'][0] }>(`/menu/${id}`, itemData)
    return {
      id:          data.item.id,
      name:        data.item.name,
      description: data.item.description ?? '',
      price:       typeof data.item.price === 'string' ? parseFloat(data.item.price) : data.item.price,
      category:    'MAINS',
      imageUrl:    data.item.imageUrl,
      isAvailable: data.item.isAvailable,
      allergens:   [],
    }
  },

  async deleteMenuItem(id: string): Promise<void> {
    await apiClient.delete(`/menu/${id}`)
  },
}
