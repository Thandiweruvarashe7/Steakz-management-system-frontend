import { useState } from 'react'
import { Megaphone, Mail, Tag, Plus, X, Send, Edit2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { toast } from '@/components/ui/use-toast'

interface Campaign {
  id: string
  name: string
  offer: string
  status: 'ACTIVE' | 'SCHEDULED' | 'DRAFT' | 'SENT'
  sent: number
  opened: number
  clicks: number
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Summer Sirloin Offer', offer: '15% off Sirloin', status: 'ACTIVE', sent: 4200, opened: 1890, clicks: 380 },
  { id: 'c2', name: 'Anniversary Dining Package', offer: 'Complimentary dessert', status: 'SCHEDULED', sent: 0, opened: 0, clicks: 0 },
  { id: 'c3', name: 'Weekend Brunch Launch', offer: '2-for-1 starters', status: 'DRAFT', sent: 0, opened: 0, clicks: 0 },
]

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  DRAFT: 'bg-gray-100 text-gray-600',
  SENT: 'bg-purple-100 text-purple-800',
}

export function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS)
  const [showNewForm, setShowNewForm] = useState(false)
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null)
  const [formName, setFormName] = useState('')
  const [formOffer, setFormOffer] = useState('')
  const [sendingId, setSendingId] = useState<string | null>(null)

  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length
  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0)

  function openNewForm() {
    setFormName('')
    setFormOffer('')
    setEditCampaign(null)
    setShowNewForm(true)
    console.log('[Marketing] Opening new campaign form')
  }

  function openEditForm(c: Campaign) {
    setFormName(c.name)
    setFormOffer(c.offer)
    setEditCampaign(c)
    setShowNewForm(true)
    console.log('[Marketing] Opening edit form for campaign:', c.id)
  }

  function submitForm() {
    if (!formName.trim() || !formOffer.trim()) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' })
      return
    }
    if (editCampaign) {
      setCampaigns((prev) => prev.map((c) => c.id === editCampaign.id ? { ...c, name: formName, offer: formOffer } : c))
      toast({ title: 'Campaign updated', variant: 'success' })
      console.log('[Marketing] Campaign updated:', editCampaign.id)
    } else {
      const newId = `c${Date.now()}`
      setCampaigns((prev) => [...prev, { id: newId, name: formName, offer: formOffer, status: 'DRAFT', sent: 0, opened: 0, clicks: 0 }])
      toast({ title: 'Campaign created', variant: 'success' })
      console.log('[Marketing] New campaign created:', newId)
    }
    setShowNewForm(false)
  }

  async function sendCampaign(c: Campaign) {
    setSendingId(c.id)
    console.log('[Marketing] Sending campaign:', c.id, c.name)
    await new Promise((r) => setTimeout(r, 1000))
    setCampaigns((prev) => prev.map((p) => p.id === c.id ? { ...p, status: 'SENT', sent: Math.floor(Math.random() * 3000) + 1000 } : p))
    toast({ title: 'Campaign sent!', description: `"${c.name}" has been dispatched to customers.`, variant: 'success' })
    console.log('[Marketing] Campaign sent successfully:', c.id)
    setSendingId(null)
  }

  return (
    <div>
      <PageHeader
        title="Marketing"
        subtitle="Campaigns and promotions management"
        action={
          <button onClick={openNewForm} className="flex items-center gap-2 bg-maroon text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Mail, label: 'Emails Sent (All Time)', value: totalSent.toLocaleString() },
          { icon: Megaphone, label: 'Active Campaigns', value: String(activeCampaigns) },
          { icon: Tag, label: 'Total Campaigns', value: String(campaigns.length) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-beige flex items-center justify-center">
              <Icon className="w-6 h-6 text-maroon" />
            </div>
            <div>
              <p className="text-xl font-serif font-bold text-maroon">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-serif font-semibold text-maroon">Email Campaigns</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-beige">
            <tr>
              {['Campaign', 'Offer', 'Status', 'Sent', 'Opened', 'Clicks', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{c.name}</td>
                <td className="px-5 py-3 text-gray-500">{c.offer}</td>
                <td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>{c.status}</span></td>
                <td className="px-5 py-3 text-gray-600">{c.sent.toLocaleString()}</td>
                <td className="px-5 py-3 text-gray-600">{c.opened && c.sent ? `${c.opened} (${Math.round(c.opened / c.sent * 100)}%)` : '—'}</td>
                <td className="px-5 py-3 text-gray-600">{c.clicks || '—'}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    {(c.status === 'DRAFT' || c.status === 'SCHEDULED') && (
                      <button
                        onClick={() => sendCampaign(c)}
                        disabled={sendingId === c.id}
                        className="text-xs bg-maroon text-white px-3 py-1 rounded-lg flex items-center gap-1 disabled:opacity-60"
                      >
                        <Send className="w-3 h-3" />
                        {sendingId === c.id ? 'Sending...' : 'Send'}
                      </button>
                    )}
                    <button onClick={() => openEditForm(c)} className="text-xs text-maroon hover:underline flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New / Edit Campaign Modal */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowNewForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif font-bold text-maroon text-lg">
                {editCampaign ? 'Edit Campaign' : 'New Campaign'}
              </h3>
              <button onClick={() => setShowNewForm(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Campaign Name</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Summer Sirloin Promotion"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Offer Description</label>
                <input
                  value={formOffer}
                  onChange={(e) => setFormOffer(e.target.value)}
                  placeholder="e.g. 15% off all steaks"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={submitForm} className="flex-1 bg-maroon text-white py-2.5 rounded-lg text-sm font-medium hover:bg-maroon-dark transition-colors">
                  {editCampaign ? 'Save Changes' : 'Create Campaign'}
                </button>
                <button onClick={() => setShowNewForm(false)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
