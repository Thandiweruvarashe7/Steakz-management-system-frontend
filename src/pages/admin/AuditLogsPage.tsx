import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { formatDateTime } from '@/lib/utils'
import apiClient from '@/lib/axios'

const MOCK_LOGS = [
  { id: 'al1', userId: 'u1', userName: 'System Admin', action: 'USER_CREATED', resource: 'User', resourceId: 'u6', ipAddress: '192.168.1.1', createdAt: '2026-06-05T20:15:00Z', details: 'Created user old@email.com' },
  { id: 'al2', userId: 'u1', userName: 'System Admin', action: 'BRANCH_UPDATED', resource: 'Branch', resourceId: 'b2', ipAddress: '192.168.1.1', createdAt: '2026-06-05T19:42:00Z', details: 'Updated opening hours for Manchester' },
  { id: 'al3', userId: 'u2', userName: 'Charlotte Hayes', action: 'PAYROLL_APPROVED', resource: 'Payroll', ipAddress: '10.0.0.5', createdAt: '2026-06-05T18:30:00Z', details: 'Approved payroll for period 2026-05' },
  { id: 'al4', userId: 'u3', userName: 'Sophie Davis', action: 'RESERVATION_UPDATED', resource: 'Reservation', resourceId: 'r1', ipAddress: '10.0.0.12', createdAt: '2026-06-05T17:15:00Z', details: 'Changed reservation status to CONFIRMED' },
  { id: 'al5', userId: 'u4', userName: 'James Wilson', action: 'ORDER_CREATED', resource: 'Order', resourceId: 'o1', ipAddress: '10.0.0.20', createdAt: '2026-06-05T19:00:00Z', details: 'New order for Table 3' },
  { id: 'al6', userId: 'u1', userName: 'System Admin', action: 'USER_DEACTIVATED', resource: 'User', resourceId: 'u6', ipAddress: '192.168.1.1', createdAt: '2026-06-04T12:00:00Z', details: 'Deactivated old@email.com' },
]

const ACTION_COLORS: Record<string, string> = {
  USER_CREATED: 'bg-green-100 text-green-700',
  USER_DEACTIVATED: 'bg-red-100 text-red-700',
  BRANCH_UPDATED: 'bg-blue-100 text-blue-700',
  PAYROLL_APPROVED: 'bg-purple-100 text-purple-700',
  RESERVATION_UPDATED: 'bg-orange-100 text-orange-700',
  ORDER_CREATED: 'bg-yellow-100 text-yellow-700',
}

export function AuditLogsPage() {
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', dateFilter, actionFilter, page],
    queryFn: async () => {
      const params: Record<string, string> = { page: String(page), limit: String(perPage) }
      if (dateFilter) params.date = dateFilter
      if (actionFilter) params.action = actionFilter
      console.log('[AuditLogs] Fetching GET /audit-logs with params:', params)
      try {
        const response = await apiClient.get('/audit-logs', { params })
        console.log('[AuditLogs] Response:', response.data)
        return response.data
      } catch (err) {
        console.warn('[AuditLogs] API not available — using mock data:', err)
        return null
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  })

  // Show mock only when API fails (null), not when it returns empty array
  const logs = data?.logs ?? (data === null ? MOCK_LOGS : [])

  const filteredLogs = logs.filter((log: typeof MOCK_LOGS[0]) => {
    const matchDate = !dateFilter || (log.createdAt?.startsWith(dateFilter) ?? false)
    const matchAction = !actionFilter || log.action === actionFilter
    const matchSearch = !search ||
      log.userName?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      (log.details ?? '').toLowerCase().includes(search.toLowerCase()) ||
      log.resource?.toLowerCase().includes(search.toLowerCase())
    return matchDate && matchAction && matchSearch
  })

  console.log('[AuditLogs] Total logs:', logs.length, '| Filtered:', filteredLogs.length, '| Source:', data?.logs ? 'API' : data === null ? 'MOCK' : 'empty')

  const totalPages = data?.totalPages ?? Math.ceil(filteredLogs.length / perPage)
  const paginated = data?.logs ? filteredLogs : filteredLogs.slice((page - 1) * perPage, page * perPage)

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="System activity and security events"
        action={
          <button onClick={() => window.print()} className="flex items-center gap-2 border border-maroon text-maroon px-4 py-2 rounded-lg text-sm font-medium hover:bg-beige transition-colors">
            <Download className="w-4 h-4" /> Export Logs
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by user, action, resource..." className="sm:w-80" />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
        />
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
        >
          <option value="">All Actions</option>
          <option value="USER_CREATED">USER_CREATED</option>
          <option value="USER_DEACTIVATED">USER_DEACTIVATED</option>
          <option value="BRANCH_UPDATED">BRANCH_UPDATED</option>
          <option value="PAYROLL_APPROVED">PAYROLL_APPROVED</option>
          <option value="RESERVATION_UPDATED">RESERVATION_UPDATED</option>
          <option value="ORDER_CREATED">ORDER_CREATED</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading audit logs…</div>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-beige">
              <tr>
                {['Timestamp', 'User', 'Action', 'Resource', 'Details', 'IP'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((log: typeof MOCK_LOGS[0]) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap font-mono">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{log.userName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.resource} {log.resourceId && <span className="text-gray-400 font-mono text-xs">#{log.resourceId}</span>}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.ipAddress}</td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No audit logs found</td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-500">{filteredLogs.length} entries {data === null ? '(demo)' : ''}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <span className="px-3 py-1.5 text-sm text-gray-600">Page {page} of {totalPages || 1}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
