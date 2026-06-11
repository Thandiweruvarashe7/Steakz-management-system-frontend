import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-maroon rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-serif font-bold text-3xl text-maroon">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: January 2026</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, make a reservation, or place an order. This includes your name, email address, phone number, and payment information.</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">2. How We Use Your Information</h2>
          <p>We use the information we collect to process reservations and orders, communicate with you about your bookings, send you promotional offers (with your consent), and improve our services.</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">3. Data Storage</h2>
          <p>Your personal data is stored securely in our systems. We retain your data for as long as your account is active or as needed to provide you with our services. You may request deletion of your data at any time by contacting us.</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">4. Sharing Your Information</h2>
          <p>We do not sell or rent your personal information to third parties. We may share your information with service providers who assist us in operating our website and conducting our business, subject to those parties agreeing to keep this information confidential.</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">5. Cookies</h2>
          <p>We use cookies to enhance your browsing experience. Please see our <Link to="/cookies" className="text-maroon hover:underline">Cookie Policy</Link> for more details.</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">6. Your Rights</h2>
          <p>Under UK GDPR, you have the right to access, correct, or delete your personal data. To exercise these rights, please contact us at <a href="mailto:privacy@steakz.co.uk" className="text-maroon hover:underline">privacy@steakz.co.uk</a>.</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact our Data Protection Officer at <a href="mailto:privacy@steakz.co.uk" className="text-maroon hover:underline">privacy@steakz.co.uk</a> or write to: STEAKZ UK Ltd, 12 Berkeley Square, London, W1J 6EQ.</p>
        </section>
      </div>
    </div>
  )
}
