import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservationService } from '@/services/reservation.service'

export function useReservations(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['reservations', params],
    queryFn: () => reservationService.getReservations(params),
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { branchId: string; tableId: string; reservationDate: string; partySize: number; specialRequests?: string }) =>
      reservationService.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}

export function useUpdateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ status: string; partySize: number; reservationDate: string }> }) =>
      reservationService.updateReservation(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  })
}

export function useCancelReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reservationService.cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}
