import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Users, Clock, Search, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SearchInput } from '@/components/ui/SearchInput'
import { SkeletonList } from '@/components/ui/SkeletonCard'
import { toast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { reservationService } from '@/services/reservation.service'
import type { Reservation } from '@/types'

const STATUS_ACTIONS: Record<string, { label: string; next: string }> = {
  PENDING: { label: 'Confirm', next: 'CONFIRMED' },
  CONFIRMED: { label: 'Seat Guest', next: 'SEATED' },
  SEATED: { label: 'Complete', next: 'COMPLETED' },
  CHECKED_IN: { label: 'Complete', next: 'COMPLETED' },
}

export function ManagerReservationsPage() {
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  })
  const qc = useQueryClient()

  const { data: reservations = [], isLoading, error } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => reservationService.getReservations(),
    refetchInterval: 15_000,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      reservationService.updateReservation(id, { status }),
    onSuccess: (updated: any) => {
      const statusLabel: Record<string, string> = {
        CONFIRMED: 'Reservation confirmed ✓',
        SEATED:    'Guest seated ✓',
        COMPLETED: 'Reservation completed ✓',
        CANCELLED: 'Reservation cancelled',
      }
      const msg = statusLabel[updated?.status ?? ''] ?? 'Reservation updated'
      console.log('[ManagerReservations] Reservation updated:', updated?.id, '→', updated?.status)
      toast({ title: msg, variant: 'success' })
      qc.invalidateQueries({ queryKey: ['reservations'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
      qc.invalidateQueries({ queryKey: ['hq-dashboard'] })
    },
    onError: (err: any) => {
      const httpStatus = err?.statusCode ?? err?.response?.status
      const msg = err?.message ?? err?.response?.data?.message ?? 'Failed to update reservation'
      console.error('[ManagerReservations] Update FAILED — HTTP:', httpStatus, '| msg:', msg)
      toast({
        title: 'Failed to update reservation',
        description: msg,
        variant: 'destructive'
      })
    },
  })

  const filtered = reservations.filter((r: Reservation) => {
    const matchDate = !dateFilter || r.date === dateFilter
    const q = search.toLowerCase()
    const matchSearch = !q || (r.customerName ?? '').toLowerCase().includes(q) || (r.customerEmail ?? '').toLowerCase().includes(q)
    return matchDate && matchSearch
  })

  return (
    <div>
      <PageHeader title="Reservations" subtitle="Manage today's and upcoming bookings" />
      <div className="mb-4 flex gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." className="max-w-xs" />
        <div className="flex items-center">
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
          <button
            onClick={() => setDateFilter('')}
            className="text-xs text-maroon underline hover:no-underline ml-2"
          >
            Show all ({reservations.length})
          </button>
        </div>
      </div>

      {isLoading ? <SkeletonList items={5} /> : error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Could not load reservations. Check that the backend server is running.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-beige">
              <tr>
                {['Guest', 'Date', 'Time', 'Party', 'Status', 'Table', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((res: Reservation) => {
                const action = res.status in STATUS_ACTIONS ? STATUS_ACTIONS[res.status] : null
                return (
                  <tr key={res.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{res.customerName ?? 'Guest'}</p>
                      <p className="text-xs text-gray-400">{res.customerEmail ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap"><CalendarDays className="w-3 h-3 inline mr-1 text-maroon" />{formatDate(res.date)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap"><Clock className="w-3 h-3 inline mr-1 text-maroon" />{res.time}</td>
                    <td className="px-4 py-3 text-gray-600"><Users className="w-3 h-3 inline mr-1 text-maroon" />{res.partySize}</td>
                    <td className="px-4 py-3"><StatusBadge status={res.status} type="reservation" /></td>
                    <td className="px-4 py-3 text-gray-500">{res.tableNumber ? `T${res.tableNumber}` : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {action && (
                          <button onClick={() => updateMutation.mutate({ id: res.id, status: action.next })}
                            disabled={updateMutation.isPending}
                            className="text-xs bg-maroon text-white px-3 py-1 rounded-lg hover:bg-maroon-dark transition-colors disabled:opacity-50">
                            {action.label}
                          </button>
                        )}
                        {(res.status === 'PENDING' || res.status === 'CONFIRMED') && (
                          <button onClick={() => updateMutation.mutate({ id: res.id, status: 'CANCELLED' })}
                            disabled={updateMutation.isPending}
                            className="text-xs text-red-500 hover:underline disabled:opacity-50">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    {dateFilter
                      ? `No reservations for ${new Date(dateFilter + 'T12:00:00').toLocaleDateString('en-GB')}. Total in system: ${reservations.length}`
                      : 'No reservations found'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4 text-center">{filtered.length} of {reservations.length} reservations · Live from PostgreSQL</p>
    </div>
  )
}
