import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '@/services/inventory.service'

export function useInventoryItems(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryService.getInventory(params),
  })
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; quantity: number; minimumStock: number; unit?: string; branchId?: string }) =>
      inventoryService.createInventoryItem(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  })
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ quantity: number; minimumStock: number; notes: string; transactionType: string }> }) =>
      inventoryService.updateInventoryItem(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  })
}
