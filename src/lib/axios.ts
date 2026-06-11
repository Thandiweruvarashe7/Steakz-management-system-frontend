import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

console.log('[Axios] Base URL configured as:', BASE_URL)

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000, // 15-second timeout — prevents hanging when backend is down
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the access token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  const user = useAuthStore.getState().user
  console.log(`[Axios] REQUEST → ${(config.method ?? 'GET').toUpperCase()} ${BASE_URL}${config.url}`, {
    hasToken: !!token,
    role: user?.role ?? 'guest',
    branchId: user?.branchId ?? null,
    params: config.params ?? {},
  })
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token as string)
  })
  failedQueue = []
}

// Auth endpoints that must NEVER trigger the 401-refresh cycle
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh']

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[Axios] RESPONSE ← ${response.status} ${response.config.url}`)
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const requestPath: string = originalRequest?.url ?? ''

    // ── Network error (no response) — backend is likely not running ──────────
    if (!error.response) {
      console.error('[Axios] NETWORK ERROR — no response received!')
      console.error('[Axios] URL attempted:', `${BASE_URL}${requestPath}`)
      console.error('[Axios] Error code:', error.code)
      console.error('[Axios] Error message:', error.message)
      console.error('[Axios] Backend URL configured as:', BASE_URL, '— check VITE_API_URL and that the backend is reachable')
      return Promise.reject({
        message: `Cannot connect to backend at ${BASE_URL}. (${error.message})`,
        code: 'NETWORK_ERROR',
        statusCode: 0,
        details: { url: `${BASE_URL}${requestPath}`, originalMessage: error.message },
      })
    }

    console.error(`[Axios] ERROR ← ${error.response.status} ${requestPath}`, error.response.data)

    // ── 429 Too Many Requests — rate limited, don't crash the UI ────────────
    if (error.response?.status === 429) {
      const pollingEndpoints = ['/orders/live', '/orders/awaiting-payment', '/tables', '/notifications']
      const isPolling = pollingEndpoints.some((p) => requestPath.includes(p))
      if (isPolling) {
        console.warn('[Axios] Rate limited (429) on polling endpoint', requestPath, '— returning empty result silently')
        return Promise.resolve({
          data: { success: true, orders: [], tables: [], notifications: [], reservations: [] },
          status: 200,
          statusText: 'OK (rate-limited fallback)',
          headers: {},
          config: originalRequest,
        })
      }
      console.warn('[Axios] Rate limited (429) on', requestPath, '— will surface to caller')
    }

    // For auth endpoints — just surface the real server error, no refresh loop
    const isAuthEndpoint = AUTH_PATHS.some((p) => requestPath.includes(p))

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true
      console.log('[Axios] 401 received — attempting token refresh via cookie…')

      try {
        const { data } = await apiClient.post('/auth/refresh')
        const newToken = data.accessToken
        console.log('[Axios] Token refresh successful — retrying original request')
        useAuthStore.getState().setAccessToken(newToken)
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        console.error('[Axios] Token refresh failed:', refreshError)
        processQueue(refreshError, null)
        // Only clear auth if the refresh token is truly invalid (401/403)
        // For network/server errors keep the session alive so the waiter isn't logged out mid-service
        const refreshStatus = (refreshError as any)?.statusCode ?? (refreshError as any)?.response?.status
        if (refreshStatus === 401 || refreshStatus === 403) {
          console.warn('[Axios] Refresh token invalid/expired — clearing auth')
          useAuthStore.getState().clearAuth()
        } else {
          console.warn('[Axios] Refresh failed due to network/server issue — keeping session alive')
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    const apiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      statusCode: error.response?.status || 500,
      details: error.response?.data?.details,
    }

    console.error('[Axios] API Error:', apiError)

    return Promise.reject(apiError)
  }
)

export default apiClient
