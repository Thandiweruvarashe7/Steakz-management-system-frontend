import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import apiClient from '@/lib/axios'

interface ApiNotification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

interface NotificationsProps {
  open: boolean
  onClose: () => void
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function typeColor(type: string): string {
  switch (type?.toUpperCase()) {
    case 'LOW_STOCK':
    case 'OUT_OF_STOCK': return 'text-amber-600 bg-amber-50'
    case 'RESERVATION':
    case 'BOOKING': return 'text-blue-600 bg-blue-50'
    case 'ORDER': return 'text-green-600 bg-green-50'
    case 'SYSTEM': return 'text-purple-600 bg-purple-50'
    default: return 'text-maroon bg-beige'
  }
}

export function NotificationsPanel({ open, onClose }: NotificationsProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const qc = useQueryClient()

  // Bug 8: fetch from GET /notifications (primary source)
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      console.log('[NotificationsPanel] Fetching GET /notifications | user:', user?.role)
      const resp = await apiClient.get<{ success: boolean; notifications: ApiNotification[]; unreadCount: number }>('/notifications')
      console.log('[NotificationsPanel] Response — count:', resp.data.notifications?.length, '| unread:', resp.data.unreadCount)
      return resp.data
    },
    enabled: open,
    refetchOnMount: true,
    staleTime: 30_000,
  })

  // Mark all notifications as read via PATCH /notifications/read-all
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      console.log('[NotificationsPanel] Marking all read — PATCH /notifications/read-all')
      await apiClient.patch('/notifications/read-all')
    },
    onSuccess: () => {
      console.log('[NotificationsPanel] All notifications marked as read')
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err) => console.error('[NotificationsPanel] Mark all read failed:', err),
  })

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  const notifications: ApiNotification[] = data?.notifications ?? []
  const unreadCount = data?.unreadCount ?? 0

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={panelRef}
        className="absolute right-4 top-16 w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 pointer-events-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-maroon" />
            <h3 className="font-serif font-bold text-maroon">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-maroon text-white rounded-full px-1.5 py-0.5 font-medium">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="flex items-center gap-1 text-xs text-maroon hover:text-maroon-dark px-2 py-1 rounded-lg hover:bg-beige transition-colors disabled:opacity-50"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
          {isLoading ? (
            <div className="py-8 text-center text-gray-400 text-sm">Loading notifications…</div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notifications right now</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-maroon' : 'bg-gray-200'}`} />
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor(n.type)}`}>
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''} · Live from PostgreSQL
          </p>
        </div>
      </div>
    </div>
  )
}
