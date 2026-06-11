import { Link } from 'react-router-dom'
import { FileText, ArrowLeft } from 'lucide-react'

export function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-maroon rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-serif font-bold text-3xl text-maroon">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: January 2026</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using the STEAKZ UK website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">2. Reservations</h2>
          <p>Reservations are subject to availability. STEAKZ UK reserves the right to cancel or modify reservations due to unforeseen circumstances. We request at least 24 hours notice for cancellations. Failure to honour a reservation without notice may result in a no-show fee.</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">3. Online Orders</h2>
          <p>All orders placed through our website are subject to acceptance by STEAKZ UK. We reserve the right to refuse service to anyone for any reason. Prices are displayed inclusive of VAT at 20%.</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">4. Account Responsibilities</h2>
          <p>You are responsible for maintaining the security of your account credentials. STEAKZ UK is not liable for any loss or damage arising from your failure to maintain account security.</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">5. Intellectual Property</h2>
          <p>All content on the STEAKZ UK website, including text, graphics, logos, and images, is the property of STEAKZ UK Ltd and is protected by UK and international copyright laws.</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">6. Limitation of Liability</h2>
          <p>STEAKZ UK shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of our services.</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">7. Governing Law</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">8. Contact</h2>
          <p>Questions about the Terms of Service should be sent to <a href="mailto:legal@steakz.co.uk" className="text-maroon hover:underline">legal@steakz.co.uk</a>.</p>
        </section>
      </div>
    </div>
  )
}
