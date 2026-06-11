import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/ui/PageHeader'
import { FloorPlanCanvas } from '@/components/floor-plan/FloorPlanCanvas'
import { StatusBadge } from '@/components/ui/StatusBadge'
import apiClient from '@/lib/axios'
import type { Table, TableStatus } from '@/types'

export function WaiterFloorPlanPage() {
  const { user } = useAuth()
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tables', 'floor-plan', user?.branchId],
    queryFn: async () => {
      console.log('[FloorPlan] Fetching tables for branch:', user?.branchId)
      const response = await apiClient.get('/tables', {
        params: { branchId: user?.branchId },
      })
      console.log('[FloorPlan] Tables received:', response.data.tables?.length ?? 0)
      return response.data
    },
    staleTime: 0,
    refetchInterval: 20_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!user?.branchId,
  })

  const liveTables: Table[] = (data?.tables ?? []).map((t: Record<string, unknown>, i: number) => ({
    id: t.id as string,
    number: (t.tableNumber as number) ?? (i + 1),
    branchId: (t.branchId as string) ?? user?.branchId ?? '',
    capacity: (t.capacity as number) ?? 2,
    status: ((t.status as string) ?? 'AVAILABLE') as TableStatus,
    shape: ((t.capacity as number) >= 6 ? 'round' : 'rectangle') as 'round' | 'rectangle',
    x: (i % 4) * 180 + 80,
    y: Math.floor(i / 4) * 180 + 80,
    guestName: (t.reservation as Record<string, Record<string, string>> | undefined)?.customer
      ? `${(t.reservation as Record<string, Record<string, string>>).customer.firstName} ${(t.reservation as Record<string, Record<string, string>>).customer.lastName}`
      : undefined,
    currentOrderId: (t.activeOrder as { id?: string } | undefined)?.id,
  }))

  const statusCounts: Record<TableStatus, number> = {
    AVAILABLE: liveTables.filter((t) => t.status === 'AVAILABLE').length,
    RESERVED: liveTables.filter((t) => t.status === 'RESERVED').length,
    OCCUPIED: liveTables.filter((t) => t.status === 'OCCUPIED').length,
    PAYMENT_PENDING: liveTables.filter((t) => t.status === 'PAYMENT_PENDING').length,
  }

  console.log('[FloorPlan] Live tables:', liveTables.length, '| Status counts:', statusCounts)

  return (
    <div>
      <PageHeader
        title="Floor Plan"
        subtitle={`Live table status — refreshes every 20s`}
        action={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600 hover:border-maroon hover:text-maroon transition-colors"
          >
            Refresh
          </button>
        }
      />

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 animate-pulse">
          Loading floor plan…
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <FloorPlanCanvas tables={liveTables} mode="view" onTableClick={setSelectedTable} />
          </div>

          <div className="space-y-4">
            {selectedTable ? (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-serif font-bold text-maroon mb-3">Table {selectedTable.number}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <StatusBadge status={selectedTable.status} type="table" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capacity</span>
                    <span className="font-medium">{selectedTable.capacity} guests</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shape</span>
                    <span className="font-medium capitalize">{selectedTable.shape}</span>
                  </div>
                  {selectedTable.guestName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Guest</span>
                      <span className="font-medium">{selectedTable.guestName}</span>
                    </div>
                  )}
                  {selectedTable.currentOrderId && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">Active Order</p>
                      <p className="text-sm font-mono text-maroon">
                        #{selectedTable.currentOrderId.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  )}
                  {(selectedTable.status === 'OCCUPIED' || selectedTable.status === 'PAYMENT_PENDING') && (
                    <div className="pt-3 border-t border-gray-100">
                      <button
                        onClick={() => (window.location.href = '/waiter/payments')}
                        className="w-full bg-maroon text-white py-2 rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                <p className="text-sm text-gray-400">Click a table to see details</p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h4 className="font-medium text-maroon mb-3 text-sm">Table Summary</h4>
              {(Object.entries(statusCounts) as [TableStatus, number][]).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center py-1.5">
                  <StatusBadge status={status} type="table" />
                  <span className="font-bold text-maroon">{count}</span>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-3 text-center">
                {liveTables.length} total tables · Live from PostgreSQL
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
