import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Phone, Mail, MapPin, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { contactSchema, type ContactFormData } from '@/lib/validators'
import { STATIC_BRANCHES } from '@/constants/nav'
import { toast } from '@/components/ui/use-toast'

export function ContactPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit(_data: ContactFormData) {
    await new Promise((r) => setTimeout(r, 600))
    setSent(true)
    reset()
    toast({ title: 'Message sent!', description: "We'll be in touch within 24 hours.", variant: 'success' })
  }

  return (
    <div className="bg-beige-light min-h-screen">
      <div className="bg-luxury py-16 text-center px-4">
        <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Get in Touch</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">Contact Us</h1>
        <p className="text-white/70 max-w-xl mx-auto">Whether you have a question, feedback, or simply want to say hello — we'd love to hear from you.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              {sent ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold text-maroon mb-2">Message Sent!</h3>
                  <p className="text-gray-600">We'll respond within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="mt-6 text-sm text-maroon underline">Send another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <h2 className="font-serif text-2xl font-bold text-maroon mb-2">Send a Message</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                      <input {...register('name')} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" placeholder="John Smith" />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <input {...register('email')} type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" placeholder="john@example.com" />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <input {...register('subject')} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon" placeholder="Reservation enquiry, feedback..." />
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                    <textarea {...register('message')} rows={6} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon resize-none" placeholder="How can we help?" />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-maroon-dark transition-colors disabled:opacity-60">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif font-bold text-maroon mb-4">Head Office</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-maroon mt-0.5" />
                  <span>12 Berkeley Square<br />London, W1J 6EQ</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-maroon" />
                  <span>020 7946 0001</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-maroon" />
                  <span>hello@steakz.co.uk</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-serif font-bold text-maroon mb-3">Branch Contacts</h3>
              <div className="space-y-3">
                {STATIC_BRANCHES.map((b) => (
                  <div key={b.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-maroon">{b.city}</p>
                    <p className="text-xs text-gray-500">{b.phone}</p>
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
