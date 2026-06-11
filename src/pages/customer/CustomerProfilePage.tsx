import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Camera } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile } from '@/queries/auth.queries'
import { profileSchema, type ProfileFormData } from '@/lib/validators'
import { PageHeader } from '@/components/ui/PageHeader'
import { toast } from '@/components/ui/use-toast'
import { getInitials, formatDate } from '@/lib/utils'
import { ROLE_LABELS } from '@/constants/roles'

export function CustomerProfilePage() {
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()

  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
    },
  })

  async function onSubmit(data: ProfileFormData) {
    try {
      await updateProfile.mutateAsync(data)
      toast({ title: 'Profile updated', variant: 'success' })
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' })
    }
  }

  if (!user) return null

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your personal information" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-maroon flex items-center justify-center text-white text-2xl font-bold font-serif">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gold flex items-center justify-center shadow-md hover:bg-gold-light transition-colors">
              <Camera className="w-4 h-4 text-maroon" />
            </button>
          </div>
          <h3 className="font-serif font-bold text-maroon text-lg">{user.firstName} {user.lastName}</h3>
          <p className="text-sm text-gray-500 mb-3">{user.email}</p>
          {user.role && (
            <span className="text-xs bg-maroon/10 text-maroon px-3 py-1 rounded-full font-medium">
              {ROLE_LABELS[user.role]}
            </span>
          )}
          <div className="border-t border-gray-100 mt-4 pt-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Member since</span>
              <span className="font-medium text-maroon">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-serif font-bold text-maroon text-lg mb-5 flex items-center gap-2">
            <User className="w-5 h-5" /> Personal Information
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input {...register('firstName')} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input {...register('lastName')} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input value={user.email} disabled className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input {...register('phone')} type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" placeholder="+44 7700 000000" />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="bg-maroon text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
