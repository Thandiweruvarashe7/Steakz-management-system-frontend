export type Role = 'ADMIN' | 'HQ_MANAGER' | 'BRANCH_MANAGER' | 'WAITER_CASHIER' | 'CUSTOMER'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  branchId?: string
  avatarUrl?: string
  phone?: string
  createdAt: string
  isActive: boolean
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
  selectedBranch?: string | null
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface UpdateProfileData {
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
}
