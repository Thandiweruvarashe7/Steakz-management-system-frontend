import { useState } from 'react'
import { Mail, Globe, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { toast } from '@/components/ui/use-toast'

export function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [taxRate, setTaxRate] = useState('20')

  return (
    <div>
      <PageHeader title="System Settings" subtitle="Global configuration and system controls" />

      <div className="space-y-6">
        {/* General settings */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-serif font-bold text-maroon text-lg flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5" /> General Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Application Name</label>
              <input defaultValue="STEAKZ UK" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
              <input defaultValue="GBP (£)" disabled className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
              <select defaultValue="Europe/London" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon">
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Europe/Paris">Europe/Paris (CET)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">VAT Rate (%)</label>
              <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
            </div>
          </div>
          <button onClick={() => toast({ title: 'Settings saved', variant: 'success' })} className="mt-5 bg-maroon text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors">
            Save Settings
          </button>
        </div>

        {/* Email settings */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-serif font-bold text-maroon text-lg flex items-center gap-2 mb-5">
            <Mail className="w-5 h-5" /> Email Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SMTP Host</label>
              <input defaultValue="smtp.steakz.co.uk" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">SMTP Port</label>
              <input defaultValue="587" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">From Address</label>
              <input defaultValue="noreply@steakz.co.uk" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
              <input defaultValue="STEAKZ UK" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" />
            </div>
          </div>
          <button onClick={() => toast({ title: 'Email config saved', variant: 'success' })} className="mt-5 bg-maroon text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors">
            Save Email Config
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <h3 className="font-serif font-bold text-red-700 text-lg flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5" /> Maintenance Mode
          </h3>
          <div className="flex items-center justify-between max-w-lg">
            <div>
              <p className="font-medium text-gray-800">Enable Maintenance Mode</p>
              <p className="text-sm text-gray-500">Public pages will show a maintenance notice. Dashboards remain accessible.</p>
            </div>
            <div
              onClick={() => { setMaintenanceMode(!maintenanceMode); toast({ title: `Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}`, variant: !maintenanceMode ? 'destructive' : 'success' }) }}
              className={`relative w-14 h-7 rounded-full cursor-pointer transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${maintenanceMode ? 'translate-x-7' : ''}`} />
            </div>
          </div>
          {maintenanceMode && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Maintenance mode is active. Public-facing pages are showing a maintenance notice.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
