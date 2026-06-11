import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Users, Clock, CheckCircle, Phone, Mail, Grid3x3 } from 'lucide-react'
import { reservationSchema, type ReservationFormData } from '@/lib/validators'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/ui/use-toast'
import { STATIC_BRANCHES } from '@/constants/nav'
import { AuthGate } from '@/components/ui/AuthGate'
import { reservationService } from '@/services/reservation.service'
import apiClient from '@/lib/axios'
import type { Reservation } from '@/types'

const TIME_SLOTS = ['12:00', '12:30', '13:00', '13:30', '14:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30']

interface ApiTable {
  id: string
  branchId: string
  capacity: number
  status: string
  tableNumber: number
}

export function ReservationsPage() {
  const { isAuthenticated, user } = useAuth()
  const [confirmed, setConfirmed] = useState<Reservation | null>(null)
  const [tables, setTables] = useState<ApiTable[]>([])
  const [tablesLoading, setTablesLoading] = useState(false)
  const [liveBranches, setLiveBranches] = useState<Array<{ id: string; name: string }>>([])
  const navigate = useNavigate()
  const qc = useQueryClient()

  // Fetch real branch IDs from DB — STATIC_BRANCHES has fake IDs like 'b1'
  useEffect(() => {
    apiClient.get('/branches')
      .then(r => {
        const branches = r.data.branches ?? r.data ?? []
        console.log('[Reservations] Live branches from DB:', branches.map((b: { id: string; name: string }) => ({ id: b.id, name: b.name })))
        setLiveBranches(branches)
      })
      .catch(() => {
        console.warn('[Reservations] Could not load branches — using static fallback')
        setLiveBranches(STATIC_BRANCHES.map(b => ({ id: b.id, name: b.name })))
      })
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { partySize: 2 },
  })

  const selectedTime = watch('time')
  const selectedBranchId = watch('branchId')
  const selectedPartySize = watch('partySize')

  // Fetch all tables for the selected branch (no status filter — backend decides availability)
  useEffect(() => {
    if (!selectedBranchId) { setTables([]); return }
    setTablesLoading(true)
    console.log('[Reservations] Fetching tables for branch:', selectedBranchId)
    apiClient.get<{ success: boolean; tables: ApiTable[] }>('/tables', { params: { branchId: selectedBranchId } })
      .then((resp) => {
        const branchTables = resp.data.tables ?? []
        console.log('[Reservations] Tables for branch:', branchTables.length, '| available:', branchTables.filter(t => t.status === 'AVAILABLE').length)
        setTables(branchTables)
      })
      .catch((err) => {
        console.error('[Reservations] Could not fetch tables (non-blocking):', err)
        setTables([])
      })
      .finally(() => setTablesLoading(false))
  }, [selectedBranchId])

  const availableTables = tables.filter(t => t.status === 'AVAILABLE' && t.capacity >= (selectedPartySize ?? 1))

  async function onSubmit(data: ReservationFormData) {
    console.log('[Reservations] SUBMIT — branch:', data.branchId, '| date:', data.date, '| time:', data.time, '| partySize:', data.partySize)

    // Let the backend auto-assign the best available table — no tableId sent
    const payload = {
      branchId: data.branchId,
      reservationDate: `${data.date}T${data.time}:00`,
      partySize: data.partySize,
      specialRequests: data.specialRequests || undefined,
    }
    console.log('[Reservations] RESERVATION POST payload (no tableId — backend auto-assigns):', payload)

    try {
      const created = await reservationService.createReservation(payload)
      console.log('[Reservations] RESERVATION POST response:', created)
      console.log('[AUDIT] RESERVATION_CREATED user:', user?.id, '| branch:', data.branchId, '| date:', data.date)
      setConfirmed(created)
      qc.invalidateQueries({ queryKey: ['reservations'] })
      qc.invalidateQueries({ queryKey: ['hq-dashboard'] })
      toast({ title: 'Table reserved!', description: 'We look forward to seeing you!', variant: 'success' })
    } catch (err: unknown) {
      console.error('[Reservations] RESERVATION POST error:', err)
      const status = (err as { response?: { status?: number } })?.response?.status
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? (err as { message?: string })?.message ?? 'Could not create reservation'
      if (status === 409) {
        toast({ title: 'No tables available', description: msg, variant: 'destructive' })
      } else {
        toast({ title: 'Reservation failed', description: msg, variant: 'destructive' })
      }
    }
  }

  // Bug 3 fix: rich confirmation screen with table and branch details
  if (confirmed) {
    const branchName = confirmed.branchName ?? STATIC_BRANCHES.find(b => b.id === confirmed.branchId)?.name ?? 'STEAKZ Branch'
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md shadow-lg">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-maroon mb-3">Reservation Confirmed!</h2>

          {/* Confirmation details */}
          <div className="bg-beige rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Branch</span>
              <span className="font-semibold text-maroon">{branchName}</span>
            </div>
            {confirmed.tableNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Table</span>
                <span className="font-semibold text-maroon">Table {confirmed.tableNumber}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-semibold text-maroon">{new Date(confirmed.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Time</span>
              <span className="font-semibold text-maroon">{confirmed.time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Guests</span>
              <span className="font-semibold text-maroon">{confirmed.partySize} {confirmed.partySize === 1 ? 'guest' : 'guests'}</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Hi {user?.firstName}, a confirmation email has been sent to {user?.email}.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/customer/reservations')}
              className="w-full bg-maroon text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-maroon-dark transition-colors"
            >
              View My Reservations
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="w-full border border-maroon text-maroon px-6 py-3 rounded-lg text-sm font-semibold hover:bg-beige transition-colors"
            >
              Back to Menu
            </button>
            <button
              onClick={() => { setConfirmed(null); setValue('branchId', ''); setValue('date', ''); setValue('time', '') }}
              className="text-sm text-gray-400 hover:text-maroon transition-colors"
            >
              Make Another Reservation
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-beige-light min-h-screen">
      {/* Hero — always public */}
      <div className="bg-luxury py-16 text-center px-4">
        <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Dine With Us</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">Reserve a Table</h1>
        <p className="text-white/70 max-w-xl mx-auto">
          Secure your table at one of our prestigious locations. We look forward to welcoming you.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Form panel — gated behind auth */}
          <div className="lg:col-span-3">
            {isAuthenticated ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-maroon mb-1">Your Details</h2>
                <p className="text-xs text-gray-400 mb-6">Booking as {user?.firstName} {user?.lastName} · {user?.email}</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Branch */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Branch</label>
                    <select
                      {...register('branchId')}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                    >
                      <option value="">Choose a location…</option>
                      {liveBranches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    {errors.branchId && <p className="text-red-500 text-xs mt-1">{errors.branchId.message}</p>}
                  </div>

                  {/* Date & Party Size */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" /> Date
                      </label>
                      <input
                        type="date"
                        {...register('date')}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                      />
                      {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> Party Size
                      </label>
                      <select
                        {...register('partySize', { valueAsNumber: true })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bug 2 fix: available tables indicator */}
                  {selectedBranchId && (
                    <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
                      tablesLoading ? 'bg-gray-50 text-gray-500' :
                      availableTables.length > 0 ? 'bg-green-50 text-green-700 border border-green-200' :
                      tables.length === 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <Grid3x3 className="w-3.5 h-3.5 flex-shrink-0" />
                      {tablesLoading
                        ? 'Checking table availability…'
                        : availableTables.length > 0
                        ? `${availableTables.length} table${availableTables.length > 1 ? 's' : ''} available at this branch for your party size`
                        : tables.length === 0
                        ? 'Tables are being prepared. Please call us or try again shortly.'
                        : 'No tables available for this party size. Please try a different date or call us.'}
                    </div>
                  )}

                  {/* Time slots */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Preferred Time
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setValue('time', slot)}
                          className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                            selectedTime === slot
                              ? 'bg-maroon text-white border-maroon'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-maroon hover:text-maroon'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
                  </div>

                  {/* Special requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Requests (optional)</label>
                    <textarea
                      {...register('specialRequests')}
                      rows={3}
                      placeholder="Allergies, dietary requirements, celebrations…"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-maroon-dark transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? 'Requesting…' : 'Request Reservation'}
                  </button>
                </form>
              </div>
            ) : (
              /* Auth gate — visitors see this instead of the form */
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-maroon mb-2">Book a Table</h2>
                <p className="text-gray-500 text-sm mb-8">
                  You need an account to reserve a table. It's free and takes less than a minute.
                </p>
                <AuthGate
                  compact
                  title="Sign in to reserve your table"
                  description="Members can book tables, manage reservations, and receive instant confirmation emails."
                  from="/reservations"
                />
              </div>
            )}
          </div>

          {/* Info panel — always public */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-maroon text-white rounded-2xl p-6">
              <h3 className="font-serif text-xl font-bold mb-4">What to Expect</h3>
              <ul className="space-y-3 text-sm text-white/80">
                {[
                  'Confirmation email within 30 minutes',
                  'Table held for 15 minutes past booking time',
                  'Dress code: Smart casual',
                  'Group bookings (8+) require a deposit',
                  'Cancellations accepted up to 24 hours prior',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-maroon mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">Our reservations team is available 7 days a week.</p>
              <div className="space-y-2">
                <a href="tel:02079460001" className="flex items-center gap-2 text-sm font-medium text-maroon hover:underline">
                  <Phone className="w-4 h-4" /> 020 7946 0001
                </a>
                <a href="mailto:reservations@steakz.co.uk" className="flex items-center gap-2 text-sm text-gray-500 hover:underline">
                  <Mail className="w-4 h-4" /> reservations@steakz.co.uk
                </a>
              </div>
            </div>

            {/* Opening hours — always public */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-maroon mb-3">Opening Hours</h3>
              <div className="space-y-2 text-sm">
                {[
                  { days: 'Monday – Thursday', hours: '12:00 – 22:00' },
                  { days: 'Friday – Saturday', hours: '12:00 – 23:00' },
                  { days: 'Sunday', hours: '12:00 – 21:00' },
                ].map(({ days, hours }) => (
                  <div key={days} className="flex justify-between">
                    <span className="text-gray-600">{days}</span>
                    <span className="font-medium text-maroon">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
