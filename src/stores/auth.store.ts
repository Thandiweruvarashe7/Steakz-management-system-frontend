import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: true,
      setAuth: (user, token) => {
        console.log('[AuthStore] setAuth — role:', user.role, '| token present:', !!token)
        set({ user, accessToken: token, isLoading: false })
      },
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      clearAuth: () => {
        console.log('[AuthStore] clearAuth — clearing session')
        set({ user: null, accessToken: null, isLoading: false })
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'steakz-auth',
      // Only persist user and token — isLoading must always restart as true
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
)
