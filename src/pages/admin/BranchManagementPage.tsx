import { useQuery } from '@tanstack/react-query'
import { MapPin, Phone, Mail, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SkeletonList } from '@/components/ui/SkeletonCard'
import { branchService, type Branch } from '@/services/branch.service'

export function BranchManagementPage() {
  const { data: branches = [], isLoading, error } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getBranches(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  })

  return (
    <div>
      <PageHeader title="Branch Management" subtitle="All branches loaded live from PostgreSQL" />

      {isLoading ? <SkeletonList items={5} /> : error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Could not load branches. Ensure the backend server is running.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {branches.map((branch: Branch) => (
            <div key={branch.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-maroon flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">Active</span>
              </div>
              <h3 className="font-serif font-bold text-maroon text-lg mb-1">{branch.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{branch.location}</p>
              <div className="space-y-1.5">
                {branch.phone && <div className="flex items-center gap-2 text-xs text-gray-500"><Phone className="w-3.5 h-3.5 text-maroon/50" />{branch.phone}</div>}
                {branch.email && <div className="flex items-center gap-2 text-xs text-gray-500"><Mail className="w-3.5 h-3.5 text-maroon/50" />{branch.email}</div>}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-300 font-mono truncate">{branch.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-6 text-center">{branches.length} branches · Live from PostgreSQL</p>
    </div>
  )
}
