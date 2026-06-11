import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import './index.css'
import { router } from '@/router'
import { queryClient } from '@/lib/queryClient'
import { Toaster } from '@/components/ui/Toaster'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'

async function bootstrap() {
  console.log('=================================================')
  console.log('[Bootstrap] STEAKZ UK Frontend starting...')
  console.log('[Bootstrap] API URL:', import.meta.env.VITE_API_URL || '/api')
  console.log('[Bootstrap] Mode:', import.meta.env.MODE)
  console.log('=================================================')

  const { setAuth, clearAuth, setLoading } = useAuthStore.getState()
  setLoading(true)

  // Check if there's a persisted session in localStorage
  const persisted = localStorage.getItem('steakz-auth')
  if (persisted) {
    try {
      const parsed = JSON.parse(persisted)
      console.log('[Bootstrap] Found persisted session — user:', parsed.state?.user?.email, '| role:', parsed.state?.user?.role)
    } catch {
      console.log('[Bootstrap] Could not parse persisted session')
    }
  } else {
    console.log('[Bootstrap] No persisted session found')
  }

  try {
    console.log('[Bootstrap] Verifying session with backend (GET /auth/me)…')
    const user = await authService.getProfile()
    const token = useAuthStore.getState().accessToken ?? ''
    console.log('[Bootstrap] ✓ Session verified:', user.email, '| role:', user.role, '| branchId:', user.branchId ?? 'none')
    setAuth(user, token)
  } catch (err) {
    const errObj = err as { message?: string; code?: string; statusCode?: number }
    if (errObj.code === 'NETWORK_ERROR') {
      console.error('[Bootstrap] ✗ Backend server unreachable — check backend is running on port 5000')
      console.error('[Bootstrap] Error:', errObj.message)
    } else if (errObj.statusCode === 401 || errObj.statusCode === 403) {
      console.log('[Bootstrap] No active session — user will need to log in')
    } else {
      console.warn('[Bootstrap] Session restore failed:', errObj.message ?? err)
    }
    clearAuth()
  }

  console.log('[Bootstrap] Rendering React app...')

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </React.StrictMode>,
  )
}

bootstrap()
