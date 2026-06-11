import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, CalendarDays, Clock, Users, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SkeletonList } from '@/components/ui/SkeletonCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { toast } from '@/components/ui/use-toast'
import { reservationService } from '@/services/reservation.service'
import { formatDate } from '@/lib/utils'
import type { Reservation, ReservationStatus } from '@/types'

const TABS: { label: string; statuses: ReservationStatus[] }[] = [
  { label: 'Upcoming', statuses: ['PENDING', 'CONFIRMED'] },
  { label: 'Past', statuses: ['COMPLETED'] },
  { label: 'Cancelled', statuses: ['CANCELLED'] },
]

export function MyReservationsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: reservations = [], isLoading, error } = useQuery({
    queryKey: ['reservations', 'my'],
    queryFn: async () => {
      console.log('[MyReservations] Fetching from GET /reservations')
      const result = await reservationService.getReservations()
      console.log('[MyReservations] RESERVATIONS RESPONSE:', result.length, 'reservations', result.map(r => ({ id: r.id, status: r.status, date: r.date })))
      return result
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    refetchInterval: 15_000,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationService.cancelReservation(id),
    onSuccess: () => {
      toast({ title: 'Reservation cancelled', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['reservations'] })
      setCancelId(null)
    },
    onError: (err: any) => {
      const msg = err?.message ?? err?.response?.data?.message ?? 'Could not cancel reservation'
      console.error('[MyReservations] Cancel failed:', msg, err)
      toast({ title: 'Could not cancel reservation', description: msg, variant: 'destructive' })
      setCancelId(null)
    },
  })

  const filtered = reservations.filter((r: Reservation) =>
    TABS[activeTab].statuses.includes(r.status)
  )

  return (
    <div>
      <PageHeader
        title="My Reservations"
        subtitle="View and manage your table bookings"
        action={
          <Link to="/reservations" className="flex items-center gap-2 bg-maroon text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors">
            <Plus className="w-4 h-4" /> New Reservation
          </Link>
        }
      />

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === i ? 'bg-white text-maroon shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonList items={3} />
      ) : error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Could not load reservations. Check that the backend server is running.</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No reservations"
          description={activeTab === 0 ? 'You have no upcoming reservations.' : 'Nothing here yet.'}
          action={activeTab === 0 ? { label: 'Book a Table', onClick: () => (window.location.href = '/reservations') } : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((res: Reservation) => (
            <div key={res.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif font-bold text-maroon">
                      {res.branchName ?? (res as unknown as { branch?: { name: string } }).branch?.name ?? 'STEAKZ Branch'}
                    </h3>
                    <StatusBadge status={res.status} type="reservation" />
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-maroon" />
                      {formatDate(res.date ?? (res as unknown as { reservationDate?: string }).reservationDate ?? '')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-maroon" />
                      {res.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-maroon" />
                      {res.partySize} {res.partySize === 1 ? 'guest' : 'guests'}
                    </span>
                    {(res.tableNumber ?? res.table?.number) && (
                      <span className="text-xs bg-beige text-maroon px-2 py-0.5 rounded-full font-medium">
                        Table {res.tableNumber ?? res.table?.number}
                      </span>
                    )}
                  </div>
                  {res.specialRequests && (
                    <p className="text-xs text-gray-400 mt-2 italic">Note: {res.specialRequests}</p>
                  )}
                </div>
                {(res.status === 'PENDING' || res.status === 'CONFIRMED') && (
                  <button
                    onClick={() => setCancelId(res.id)}
                    className="text-sm text-red-600 hover:text-red-800 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={(open) => !open && setCancelId(null)}
        title="Cancel Reservation"
        description="Are you sure you want to cancel this reservation? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        variant="destructive"
        onConfirm={() => cancelId && cancelMutation.mutate(cancelId)}
      />
    </div>
  )
}
