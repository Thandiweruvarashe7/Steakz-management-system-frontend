import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bell, Lock, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validators'
import { toast } from '@/components/ui/use-toast'

export function CustomerSettingsPage() {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [notifications, setNotifications] = useState({
    reservationConfirmations: true,
    reservationReminders: true,
    orderUpdates: false,
    promotions: false,
    newsletter: true,
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onPasswordChange(_data: ChangePasswordFormData) {
    await new Promise((r) => setTimeout(r, 600))
    toast({ title: 'Password changed successfully', variant: 'success' })
    reset()
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account preferences" />

      <div className="space-y-6">
        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-serif font-bold text-maroon text-lg flex items-center gap-2 mb-5">
            <Bell className="w-5 h-5" /> Notification Preferences
          </h3>
          <div className="space-y-4">
            {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(([key, value]) => {
              const labels: Record<keyof typeof notifications, string> = {
                reservationConfirmations: 'Reservation confirmations',
                reservationReminders: 'Reservation reminders (24hr notice)',
                orderUpdates: 'Order status updates',
                promotions: 'Promotional offers',
                newsletter: 'Monthly newsletter',
              }
              return (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">{labels[key]}</span>
                  <div
                    onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${value ? 'bg-maroon' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
                  </div>
                </label>
              )
            })}
          </div>
          <button
            onClick={() => toast({ title: 'Preferences saved', variant: 'success' })}
            className="mt-5 bg-maroon text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors"
          >
            Save Preferences
          </button>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-serif font-bold text-maroon text-lg flex items-center gap-2 mb-5">
            <Lock className="w-5 h-5" /> Change Password
          </h3>
          <form onSubmit={handleSubmit(onPasswordChange)} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <input {...register('currentPassword')} type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
              {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input {...register('newPassword')} type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
              {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input {...register('confirmPassword')} type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="bg-maroon text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors disabled:opacity-60">
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <h3 className="font-serif font-bold text-red-700 text-lg flex items-center gap-2 mb-3">
            <Trash2 className="w-5 h-5" /> Danger Zone
          </h3>
          <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button
            onClick={() => setDeleteOpen(true)}
            className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Account"
        description="This will permanently delete your account, reservations, and all data. This cannot be undone."
        confirmLabel="Delete Forever"
        variant="destructive"
        onConfirm={() => { toast({ title: 'Account deletion requested', variant: 'destructive' }); setDeleteOpen(false) }}
      />
    </div>
  )
}
