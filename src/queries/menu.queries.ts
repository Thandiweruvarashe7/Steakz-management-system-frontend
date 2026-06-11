import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuService } from '@/services/menu.service'
import type { CreateMenuItemData } from '@/types'

export function useMenuItems() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: () => menuService.getMenuItems(),
  })
}

export function useMenuItem(id: string) {
  return useQuery({
    queryKey: ['menu', id],
    queryFn: () => menuService.getMenuItemById(id),
    enabled: !!id,
  })
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMenuItemData) => menuService.createMenuItem(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu'] }),
  })
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMenuItemData> }) =>
      menuService.updateMenuItem(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu'] }),
  })
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => menuService.deleteMenuItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu'] }),
  })
}
