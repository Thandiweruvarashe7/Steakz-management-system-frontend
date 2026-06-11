import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffService } from '@/services/staff.service'

export function useStaff(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['staff', params],
    queryFn: () => staffService.getStaff(params),
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { firstName: string; lastName: string; email: string; password: string; role: string; branchId?: string; salary?: number; shift?: string }) =>
      staffService.createStaff(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ role: string; branchId: string; salary: number; shift: string; employeeStatus: string }> }) =>
      staffService.updateStaff(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })
}

export function useDeleteStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => staffService.deleteStaff(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })
}
