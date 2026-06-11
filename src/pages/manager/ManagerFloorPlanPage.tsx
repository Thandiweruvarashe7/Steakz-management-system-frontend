import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X, RefreshCw, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FloorPlanCanvas } from '@/components/floor-plan/FloorPlanCanvas'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { toast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/stores/auth.store'
import apiClient from '@/lib/axios'
import type { Table, TableStatus } from '@/types'

interface ApiTable {
  id: string
  tableNumber: number
  capacity: number
  status: string
  branchId: string
}

function apiTableToCanvas(t: ApiTable, index: number): Table {
  return {
    id: t.id,
    number: t.tableNumber,
    branchId: t.branchId,
    capacity: t.capacity,
    status: t.status as TableStatus,
    x: (index % 4) * 140 + 40,
    y: Math.floor(index / 4) * 120 + 40,
    shape: (index % 3 === 0 ? 'round' : 'rectangle') as 'round' | 'rectangle',
  }
}

export function ManagerFloorPlanPage() {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [showAddTable, setShowAddTable] = useState(false)
  const [newTableNumber, setNewTableNumber] = useState('')
  const [newTableCapacity, setNewTableCapacity] = useState('2')
  const user = useAuthStore.getState().user
  const qc = useQueryClient()

  // Bug 6 fix: fetch real tables from API with 30-second polling
  const { data: apiTables = [], isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ['tables', user?.branchId ?? 'all'],
    queryFn: async () => {
      console.log('[FloorPlan] Fetching tables from GET /tables | branchId:', user?.branchId)
      const resp = await apiClient.get<{ success: boolean; tables: ApiTable[] }>('/tables')
      const all = resp.data.tables ?? []
      const filtered = user?.branchId ? all.filter(t => t.branchId === user.branchId) : all
      console.log('[FloorPlan] Loaded', filtered.length, 'tables for this branch')
      return filtered
    },
    refetchInterval: 15_000,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const tables: Table[] = apiTables.map(apiTableToCanvas)

  // Update table status via PUT /tables/:id
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TableStatus }) => {
      console.log('[FloorPlan] Updating table', id, 'status →', status)
      await apiClient.put(`/tables/${id}`, { status })
    },
    onSuccess: (_, { id, status }) => {
      console.log('[FloorPlan] Table status updated:', id, '→', status)
      qc.invalidateQueries({ queryKey: ['tables'] })
      setSelectedTable((prev) => prev?.id === id ? { ...prev, status } : prev)
      toast({ title: `Table status updated to ${status.replace('_', ' ')}`, variant: 'success' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Could not update table status'
      const status = (err as { response?: { status?: number } })?.response?.status
      console.error('[FloorPlan] Table status update failed — HTTP:', status, '| msg:', msg)
      toast({ title: msg, variant: 'destructive' })
    },
  })

  // Add new table via POST /tables
  const addTableMutation = useMutation({
    mutationFn: async ({ tableNumber, capacity }: { tableNumber: number; capacity: number }) => {
      if (!user?.branchId) throw new Error('No branch assigned')
      console.log('[FloorPlan] Creating table — branchId:', user.branchId, '| tableNumber:', tableNumber, '| capacity:', capacity)
      const resp = await apiClient.post<{ success: boolean; table: ApiTable }>('/tables', {
        branchId: user.branchId, tableNumber, capacity,
      })
      return resp.data.table
    },
    onSuccess: (t) => {
      console.log('[FloorPlan] Table created:', t.id, '| number:', t.tableNumber)
      qc.invalidateQueries({ queryKey: ['tables'] })
      toast({ title: `Table ${t.tableNumber} added`, description: `Capacity: ${t.capacity} guests`, variant: 'success' })
      setShowAddTable(false)
      setNewTableNumber('')
      setNewTableCapacity('2')
    },
    onError: (err: unknown) => {
      console.error('[FloorPlan] Add table error:', err)
      toast({ title: 'Failed to add table', description: (err as { message?: string })?.message || 'Server error', variant: 'destructive' })
    },
  })

  function handleAddTable(e: { preventDefault: () => void }) {
    e.preventDefault()
    const tableNum = parseInt(newTableNumber)
    const capacity = parseInt(newTableCapacity)
    if (!tableNum || tableNum < 1) { toast({ title: 'Invalid table number', variant: 'destructive' }); return }
    addTableMutation.mutate({ tableNumber: tableNum, capacity })
  }

  return (
    <div>
      <PageHeader
        title="Floor Plan"
        subtitle={`Table management — live from PostgreSQL${dataUpdatedAt ? ` · last updated ${new Date(dataUpdatedAt).toLocaleTimeString('en-GB')}` : ''}`}
        action={
          <div className="flex gap-3">
            <button
              onClick={() => qc.invalidateQueries({ queryKey: ['tables'] })}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={() => setShowAddTable(true)}
              className="flex items-center gap-2 border border-maroon text-maroon px-4 py-2 rounded-lg text-sm font-medium hover:bg-beige transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Table
            </button>
          </div>
        }
      />

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Could not load tables from database. Check the backend server.
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 h-64 flex items-center justify-center text-gray-400 text-sm">
          Loading tables from database…
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <FloorPlanCanvas tables={tables} mode="edit" onTableClick={setSelectedTable} />
          </div>
          <div className="space-y-4">
            {selectedTable ? (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-serif font-bold text-maroon mb-4">Table {selectedTable.number}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <StatusBadge status={selectedTable.status} type="table" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capacity</span>
                    <span className="font-medium">{selectedTable.capacity} guests</span>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-2">Change Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['AVAILABLE', 'RESERVED', 'OCCUPIED', 'PAYMENT_PENDING'] as TableStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatusMutation.mutate({ id: selectedTable.id, status: s })}
                          disabled={updateStatusMutation.isPending}
                          className={`text-xs py-1.5 px-2 rounded-lg border transition-colors ${selectedTable.status === s ? 'bg-maroon text-white border-maroon' : 'border-gray-200 text-gray-600 hover:border-maroon hover:text-maroon disabled:opacity-50'}`}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                <p className="text-sm text-gray-400">Click a table to edit status</p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h4 className="font-medium text-maroon mb-3 text-sm">Summary — {tables.length} tables</h4>
              {(['AVAILABLE', 'RESERVED', 'OCCUPIED', 'PAYMENT_PENDING'] as const).map((status) => (
                <div key={status} className="flex justify-between items-center py-1.5">
                  <StatusBadge status={status} type="table" />
                  <span className="font-bold text-maroon">{tables.filter((t) => t.status === status).length}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Table modal */}
      {showAddTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-maroon text-lg">Add New Table</h3>
              <button onClick={() => setShowAddTable(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                <input
                  type="number"
                  min="1"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder={`e.g. ${tables.length + 1}`}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <select
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                >
                  {[2, 4, 6, 8, 10, 12].map((n) => (
                    <option key={n} value={n}>{n} guests</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddTable(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={addTableMutation.isPending}
                  className="flex-1 bg-maroon text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-maroon-dark transition-colors disabled:opacity-60">
                  {addTableMutation.isPending ? 'Adding…' : 'Add Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
