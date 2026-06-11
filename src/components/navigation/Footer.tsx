import { Link } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react'
import { STATIC_BRANCHES } from '@/constants/nav'
import apiClient from '@/lib/axios'

export function Footer() {
  const [newsletterName, setNewsletterName] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterDone, setNewsletterDone] = useState(false)
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValidEmail = EMAIL_REGEX.test(newsletterEmail)

  async function handleNewsletter(e: FormEvent) {
    e.preventDefault()
    setEmailError('')
    if (!newsletterName.trim()) { setEmailError('Please enter your name'); return }
    if (!isValidEmail) { setEmailError('Please enter a valid email address'); return }
    setNewsletterLoading(true)
    try {
      console.log('[Footer] Newsletter signup:', newsletterEmail, '| name:', newsletterName)
      await apiClient.post('/newsletter', { email: newsletterEmail, name: newsletterName.trim() })
      console.log('[Footer] Newsletter signup successful:', newsletterEmail)
      setNewsletterDone(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? (err as { message?: string })?.message ?? ''
      console.error('[Footer] Newsletter signup error:', msg)
      if (msg.toLowerCase().includes('already')) {
        setEmailError('This email is already subscribed')
      } else {
        setEmailError('Could not subscribe. Please try again.')
      }
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <footer className="bg-maroon text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-gold mb-4">STEAKZ UK</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              An unrivalled steakhouse experience. Premium cuts, expertly prepared and served in a setting of understated luxury.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-maroon transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-maroon transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-maroon transition-colors"
                aria-label="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Our Menu', href: '/menu' },
                { label: 'Branches', href: '/branches' },
                { label: 'Book a Table', href: '/reservations' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-white/70 hover:text-gold text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* All 5 Branches — Liverpool included */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gold mb-4">Our Branches</h4>
            <ul className="space-y-3">
              {STATIC_BRANCHES.map((branch) => (
                <li key={branch.id} className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">STEAKZ {branch.city}</p>
                    <p className="text-white/60 text-xs">{branch.address}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="w-4 h-4 text-gold" />
                020 7946 0001
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="w-4 h-4 text-gold" />
                hello@steakz.co.uk
              </li>
            </ul>
            <div className="mt-6">
              <h5 className="text-sm font-medium text-white mb-2">Newsletter</h5>
              {newsletterDone ? (
                <p className="text-sm text-gold font-medium">Successfully subscribed to the Steakz UK Newsletter!</p>
              ) : (
                <form onSubmit={handleNewsletter} className="space-y-2">
                  <input
                    type="text"
                    value={newsletterName}
                    onChange={(e) => { setNewsletterName(e.target.value); setEmailError('') }}
                    placeholder="Your name"
                    className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold ${emailError && !newsletterName.trim() ? 'border-red-400' : 'border-white/20'}`}
                  />
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => { setNewsletterEmail(e.target.value); setEmailError('') }}
                      placeholder="Your email"
                      className={`flex-1 bg-white/10 border rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold ${emailError && newsletterName.trim() ? 'border-red-400' : 'border-white/20'}`}
                    />
                    <button
                      type="submit"
                      disabled={!newsletterName.trim() || !isValidEmail || newsletterLoading}
                      className="bg-gold text-maroon px-3 py-2 rounded-lg text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {newsletterLoading ? '…' : 'Join'}
                    </button>
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-300">{emailError}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} STEAKZ UK Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            {/* Legal pages — use Link so they route internally */}
            <Link to="/privacy" className="text-white/40 hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-white/40 hover:text-white text-sm transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="text-white/40 hover:text-white text-sm transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
