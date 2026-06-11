import { Link } from 'react-router-dom'
import { Cookie, ArrowLeft } from 'lucide-react'

export function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-maroon rounded-xl flex items-center justify-center">
          <Cookie className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-serif font-bold text-3xl text-maroon">Cookie Policy</h1>
          <p className="text-sm text-gray-500">Last updated: January 2026</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">What Are Cookies?</h2>
          <p>Cookies are small text files placed on your device when you visit a website. They help websites remember your preferences and improve your experience. We use cookies in accordance with UK GDPR and the Privacy and Electronic Communications Regulations (PECR).</p>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">Cookies We Use</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Essential Cookies</h3>
              <p className="text-sm text-gray-600">These cookies are required for the website to function properly. They enable you to log in, make reservations, and place orders. These cookies cannot be disabled.</p>
              <p className="text-xs text-gray-500 mt-2">Examples: session tokens, authentication cookies (steakz-auth)</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Preference Cookies</h3>
              <p className="text-sm text-gray-600">These cookies remember your preferences such as your preferred branch, basket contents, and display settings.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Analytics Cookies</h3>
              <p className="text-sm text-gray-600">We use analytics to understand how visitors use our website, which pages are most popular, and how we can improve the experience. All data is anonymised.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">Managing Cookies</h2>
          <p>You can control cookies through your browser settings. However, disabling essential cookies may prevent you from using certain features of our website such as logging in or making reservations.</p>
          <p className="mt-2">Most browsers allow you to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
            <li>See what cookies have been set</li>
            <li>Allow, block, or delete cookies</li>
            <li>Set preferences for specific websites</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif font-bold text-xl text-maroon mb-3">Contact Us</h2>
          <p>If you have questions about our use of cookies, please contact us at <a href="mailto:privacy@steakz.co.uk" className="text-maroon hover:underline">privacy@steakz.co.uk</a>.</p>
          <p className="mt-2">See also our <Link to="/privacy" className="text-maroon hover:underline">Privacy Policy</Link> and <Link to="/terms" className="text-maroon hover:underline">Terms of Service</Link>.</p>
        </section>
      </div>
    </div>
  )
}
