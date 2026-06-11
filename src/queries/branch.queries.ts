import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { branchService } from '@/services/branch.service'
import type { Branch } from '@/services/branch.service'

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getBranches(),
  })
}

export function useBranch(id: string) {
  return useQuery({
    queryKey: ['branches', id],
    queryFn: () => branchService.getBranchById(id),
    enabled: !!id,
  })
}

export function useUpdateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Branch> }) =>
      branchService.updateBranch(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  })
}
