import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MenuItem } from '@/types'

export interface BasketItem {
  menuItem: MenuItem
  quantity: number
  cookingPreference?: string
}

interface BasketStore {
  items: BasketItem[]
  branchId: string | null
  branchName: string | null
  addItem: (menuItem: MenuItem, cookingPreference?: string, branchId?: string) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, qty: number) => void
  clearBasket: () => void
  setBranchId: (id: string | null) => void
  setBranch: (id: string, name: string) => void
}

export const useBasketStore = create<BasketStore>()(
  persist(
    (set) => ({
      items: [],
      branchId: null,
      branchName: null,

      addItem: (menuItem, cookingPreference, branchId) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.menuItem.id === menuItem.id && i.cookingPreference === cookingPreference
          )
          const newBranchId = branchId ?? state.branchId
          if (existing) {
            return {
              branchId: newBranchId,
              items: state.items.map((i) =>
                i.menuItem.id === menuItem.id && i.cookingPreference === cookingPreference
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return {
            branchId: newBranchId,
            items: [...state.items, { menuItem, quantity: 1, cookingPreference }],
          }
        }),

      removeItem: (menuItemId) =>
        set((state) => ({ items: state.items.filter((i) => i.menuItem.id !== menuItemId) })),

      updateQuantity: (menuItemId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.menuItem.id !== menuItemId)
              : state.items.map((i) =>
                  i.menuItem.id === menuItemId ? { ...i, quantity: qty } : i
                ),
        })),

      clearBasket: () => set({ items: [], branchId: null, branchName: null }),

      setBranchId: (id) => set({ branchId: id }),

      setBranch: (id, name) => set({ branchId: id || null, branchName: name || null }),
    }),
    { name: 'steakz-basket' }
  )
)

// Selectors
export const selectItemCount = (s: BasketStore) =>
  s.items.reduce((sum, i) => sum + i.quantity, 0)

export const selectSubtotal = (s: BasketStore) =>
  s.items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0)

export const selectBranchId = (s: BasketStore) => s.branchId
export const selectBranchName = (s: BasketStore) => s.branchName
