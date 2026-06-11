import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '@/services/order.service'

export function useOrders(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getOrders(params),
  })
}

export function useLiveOrders(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['orders', 'live', params],
    queryFn: () => orderService.getLiveOrders(params),
    refetchInterval: 30000,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { tableId: string; items: Array<{ menuItemId: string; quantity: number }> }) =>
      orderService.createOrder(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderService.updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}
