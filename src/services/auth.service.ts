import apiClient from '@/lib/axios'
import type { AuthResponse, LoginCredentials, RegisterData, UpdateProfileData, User } from '@/types'
import type { Role } from '@/types/auth'

// CHEF and KITCHEN_ASSISTANT have no dedicated dashboard — route them as WAITER_CASHIER
const ROLE_MAP: Record<string, Role> = {
  ADMIN:              'ADMIN',
  HQ_MANAGER:         'HQ_MANAGER',
  BRANCH_MANAGER:     'BRANCH_MANAGER',
  WAITER_CASHIER:     'WAITER_CASHIER',
  CHEF:               'WAITER_CASHIER',
  KITCHEN_ASSISTANT:  'WAITER_CASHIER',
  CUSTOMER:           'CUSTOMER',
}

function normalizeUser(raw: Record<string, unknown>): User {
  const backendRole = raw.role as string
  const mappedRole = ROLE_MAP[backendRole] ?? (backendRole as Role)
  console.log('[Auth] normalizeUser — backend role:', backendRole, '→ frontend role:', mappedRole)
  return {
    id:         raw.id as string,
    email:      raw.email as string,
    firstName:  raw.firstName as string,
    lastName:   raw.lastName as string,
    role:       mappedRole,
    branchId:   (raw.branchId as string | undefined) ?? undefined,
    avatarUrl:  (raw.avatarUrl as string | undefined) ?? undefined,
    phone:      (raw.phone as string | undefined) ?? undefined,
    createdAt:  (raw.createdAt as string) ?? new Date().toISOString(),
    isActive:   raw.employeeStatus !== 'TERMINATED',
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('================================================')
    console.log('[Auth] login() — START')
    console.log('[Auth] LOGIN REQUEST:', { email: credentials.email, password: '[HIDDEN]' })
    console.log('[Auth] Sending POST /auth/login to:', (import.meta.env.VITE_API_URL || '/api') + '/auth/login')

    let data: { success: boolean; accessToken: string; user: Record<string, unknown> }
    try {
      const response = await apiClient.post<{ success: boolean; accessToken: string; user: Record<string, unknown> }>(
        '/auth/login',
        credentials
      )
      data = response.data
    } catch (err) {
      console.error('[Auth] LOGIN ERROR:', err)
      console.error('[Auth] Error type:', typeof err)
      console.error('[Auth] Error details:', JSON.stringify(err, null, 2))
      throw err
    }

    console.log('[Auth] LOGIN RAW RESPONSE:', {
      success: data.success,
      hasAccessToken: !!data.accessToken,
      accessTokenPrefix: data.accessToken ? data.accessToken.substring(0, 20) + '...' : 'MISSING',
      userEmail: data.user?.email,
      userRole: data.user?.role,
      userBranchId: data.user?.branchId,
    })

    if (!data.success) {
      console.error('[Auth] Login returned success=false:', data)
      throw new Error('Login failed — server returned success: false')
    }

    if (!data.accessToken) {
      console.error('[Auth] Login response missing accessToken! Full response:', data)
      throw new Error('Login failed — no access token in response')
    }

    const user = normalizeUser(data.user)
    console.log('[Auth] login() — COMPLETE — normalized user:', { id: user.id, email: user.email, role: user.role, branchId: user.branchId })
    console.log('================================================')

    return {
      accessToken: data.accessToken,
      user,
    }
  },

  async register(userData: RegisterData): Promise<{ user: User }> {
    console.log('[Auth] register() — sending POST /auth/register for:', userData.email)
    const { data } = await apiClient.post<{ success: boolean; user: Record<string, unknown> }>(
      '/auth/register',
      {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
      }
    )
    console.log('[Auth] register() — success:', data.success, '| email:', data.user?.email)
    return { user: normalizeUser(data.user) }
  },

  async logout(): Promise<void> {
    console.log('[Auth] logout() — calling POST /auth/logout')
    await apiClient.post('/auth/logout')
    console.log('[Auth] logout() — complete')
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    console.log('[Auth] refreshToken() — calling POST /auth/refresh')
    const { data } = await apiClient.post<{ success: boolean; accessToken: string }>('/auth/refresh')
    console.log('[Auth] refreshToken() — new token received:', !!data.accessToken)
    return { accessToken: data.accessToken }
  },

  async getProfile(): Promise<User> {
    console.log('[Auth] getProfile() — calling GET /auth/me')
    const { data } = await apiClient.get<{ success: boolean; user: Record<string, unknown> }>('/auth/me')
    console.log('[Auth] getProfile() — received user:', data.user?.email, '| role:', data.user?.role)
    return normalizeUser(data.user)
  },

  // Backend uses PUT /users/:id for profile updates (not PATCH /auth/profile)
  async updateProfile(userData: UpdateProfileData & { id?: string }): Promise<User> {
    const { useAuthStore } = await import('@/stores/auth.store')
    const currentUser = useAuthStore.getState().user
    if (!currentUser?.id) {
      console.error('[Auth] updateProfile() — no authenticated user!')
      throw new Error('Not authenticated')
    }
    console.log('[Auth] updateProfile() — calling PUT /users/' + currentUser.id, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
    })
    const { data } = await apiClient.put<{ success: boolean; user: Record<string, unknown> }>(
      `/users/${currentUser.id}`,
      userData
    )
    console.log('[Auth] updateProfile() — success:', data.success, '| updated email:', data.user?.email)
    return normalizeUser(data.user)
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    console.log('[Auth] changePassword() — calling POST /auth/change-password')
    await apiClient.post('/auth/change-password', { currentPassword, newPassword })
    console.log('[Auth] changePassword() — complete')
  },
}
