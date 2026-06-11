import apiClient from '@/lib/axios'
import type { Table, TableStatus, FloorPlanLayout } from '@/types'

export const tableService = {
  async getTables(branchId: string): Promise<Table[]> {
    const { data } = await apiClient.get<Table[]>('/tables', { params: { branchId } })
    return data
  },

  async updateTableStatus(id: string, status: TableStatus): Promise<Table> {
    const { data } = await apiClient.patch<Table>(`/tables/${id}/status`, { status })
    return data
  },

  async assignTable(tableId: string, reservationId: string): Promise<Table> {
    const { data } = await apiClient.post<Table>(`/tables/${tableId}/assign`, { reservationId })
    return data
  },

  async updateFloorPlan(layout: FloorPlanLayout): Promise<FloorPlanLayout> {
    const { data } = await apiClient.put<FloorPlanLayout>(`/tables/floor-plan/${layout.branchId}`, layout)
    return data
  },
}
