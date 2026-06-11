import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tableService } from '@/services/table.service'
import type { TableStatus, FloorPlanLayout } from '@/types'

export function useTables(branchId: string) {
  return useQuery({
    queryKey: ['tables', branchId],
    queryFn: () => tableService.getTables(branchId),
    refetchInterval: 15000,
    enabled: !!branchId,
  })
}

export function useUpdateTableStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      tableService.updateTableStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tables'] }),
  })
}

export function useAssignTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tableId, reservationId }: { tableId: string; reservationId: string }) =>
      tableService.assignTable(tableId, reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}

export function useUpdateFloorPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (layout: FloorPlanLayout) => tableService.updateFloorPlan(layout),
    onSuccess: (_, layout) => queryClient.invalidateQueries({ queryKey: ['tables', layout.branchId] }),
  })
}
