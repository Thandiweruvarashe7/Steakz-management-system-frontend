import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { ROLE_DASHBOARD_ROUTES } from '@/constants/roles'
import type { LoginCredentials, RegisterData, UpdateProfileData } from '@/types'

export function useCurrentUser() {
  const setLoading = useAuthStore((s) => s.setLoading)

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const user = await authService.getProfile()
        setLoading(false)
        return user
      } catch {
        setLoading(false)
        throw new Error('Not authenticated')
      }
    },
    retry: false,
    staleTime: 10 * 60 * 1000,
  })
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      console.log('[useLogin] onSuccess — storing auth state')
      console.log('[useLogin] User:', data.user.email, '| Role:', data.user.role, '| BranchId:', data.user.branchId ?? 'none')
      const redirectPath = ROLE_DASHBOARD_ROUTES[data.user.role] ?? '/'
      console.log('[useLogin] Calculated redirect path:', redirectPath)
      setAuth(data.user, data.accessToken)
      console.log('[useLogin] Auth stored in Zustand — isLoading set to false')
      queryClient.setQueryData(['user'], data.user)
    },
    onError: (err) => {
      console.error('[useLogin] onError — mutation failed:', err)
      console.error('[useLogin] Error message:', (err as { message?: string })?.message)
    },
  })
}

// Register creates an account but does NOT auto-login.
// Backend doesn't issue a token on register — users must log in separately.
export function useRegister() {
  return useMutation({
    mutationFn: (userData: RegisterData) => authService.register(userData),
    onSuccess: (data) => {
      console.log('[useRegister] Registration successful:', data.user.email)
    },
    onError: (err) => {
      console.error('[useRegister] Registration failed:', err)
    },
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      console.log('[useLogout] Clearing auth state and query cache')
      clearAuth()
      queryClient.clear()
    },
  })
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileData) => authService.updateProfile(data),
    onSuccess: (user) => {
      console.log('[useUpdateProfile] Profile updated — new data:', user.email, user.firstName, user.lastName)
      setUser(user)
      queryClient.setQueryData(['user'], user)
    },
    onError: (err) => {
      console.error('[useUpdateProfile] Profile update failed:', err)
    },
  })
}
