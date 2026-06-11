import { Link } from 'react-router-dom'
import { ArrowRight, Star, MapPin, Clock, Award, ChefHat } from 'lucide-react'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { STATIC_MENU_ITEMS, STATIC_BRANCHES } from '@/constants/nav'
import { formatCurrency } from '@/lib/utils'

const FEATURED_ITEMS = STATIC_MENU_ITEMS.filter((i) => i.featured)

const TESTIMONIALS = [
  { name: 'James H.', rating: 5, text: 'Absolutely extraordinary. The Tomahawk was cooked to perfection — best steak I have had outside of Buenos Aires.' },
  { name: 'Sarah M.', rating: 5, text: 'The atmosphere is unmatched. From the moment you arrive, you feel like royalty. We will absolutely be returning.' },
  { name: 'David K.', rating: 5, text: 'The sommelier\'s wine pairing with the ribeye was inspired. A truly world-class dining experience.' },
]

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-luxury overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544025162-d76694265947?w=1920&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-16 bg-gold" />
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Est. 2010</span>
            <div className="h-px w-16 bg-gold" />
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            An Unrivalled<br />
            <span className="text-gradient-gold">Steakhouse</span><br />
            Experience
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Prime cuts, expertly sourced and aged to perfection. Served in an atmosphere of understated luxury across four prestigious UK locations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/reservations"
              className="inline-flex items-center justify-center gap-2 bg-gold text-maroon px-8 py-4 rounded-lg font-semibold text-sm tracking-wide hover:bg-gold-light transition-colors"
            >
              Reserve a Table
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-4 rounded-lg font-medium text-sm tracking-wide hover:bg-white/10 transition-colors"
            >
              Explore Menu
            </Link>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/30" />
          <span className="text-xs tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-maroon-dark py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { value: '15+', label: 'Years of Excellence' },
            { value: '5', label: 'UK Locations' },
            { value: '28-Day', label: 'Dry Aged Cuts' },
            { value: '50k+', label: 'Happy Guests' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-gold text-2xl font-serif font-bold">{stat.value}</div>
              <div className="text-white/60 text-xs tracking-wide mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Menu */}
      <section className="py-20 px-4 bg-beige-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Our Selection</span>
            <h2 className="font-serif text-4xl font-bold text-maroon mt-2 mb-4">Signature Dishes</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              From our celebrated steaks to our carefully crafted mains, every dish tells a story of exceptional ingredients and masterful preparation.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_ITEMS.map((item) => (
              <MenuItemCard key={item.id} item={{ ...item, allergens: item.allergens }} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 border-2 border-maroon text-maroon px-8 py-3 rounded-lg font-medium hover:bg-maroon hover:text-white transition-colors"
            >
              View Full Menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Find Us</span>
            <h2 className="font-serif text-4xl font-bold text-maroon mt-2 mb-4">Our Locations</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATIC_BRANCHES.map((branch) => (
              <div key={branch.id} className="bg-beige rounded-xl p-6 hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 rounded-full bg-maroon flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-serif font-bold text-maroon mb-1">{branch.city}</h3>
                <p className="text-sm text-gray-600 mb-1">{branch.address}</p>
                <p className="text-xs text-gray-400 mb-4">{branch.postcode}</p>
                <Link
                  to="/reservations"
                  className="text-sm font-medium text-maroon hover:text-gold flex items-center gap-1 transition-colors"
                >
                  Book Here <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience section */}
      <section className="py-20 px-4 bg-maroon text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">The STEAKZ Difference</span>
            <h2 className="font-serif text-4xl font-bold mt-3 mb-6 leading-tight">
              Where Passion Meets<br />Perfection on Every Plate
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              We source our beef exclusively from hand-selected farms across the British Isles and Argentina, dry-aging each cut for a minimum of 28 days to develop unparalleled depth of flavour.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Award, text: 'Michelin-Starred Techniques' },
                { icon: ChefHat, text: 'Expert Chefs' },
                { icon: Clock, text: '28-Day Dry Aged' },
                { icon: Star, text: '5-Star Rated' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gold flex-shrink-0" />
                  <span className="text-sm text-white/80">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl font-serif font-bold text-gold mb-1">{formatCurrency(28.95)}+</div>
              <div className="text-xs text-white/60">Starting Price</div>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl font-serif font-bold text-gold mb-1">28</div>
              <div className="text-xs text-white/60">Days Aged</div>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl font-serif font-bold text-gold mb-1">100%</div>
              <div className="text-xs text-white/60">British Sourced</div>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl font-serif font-bold text-gold mb-1">4.9</div>
              <div className="text-xs text-white/60">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-beige">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Guest Reviews</span>
            <h2 className="font-serif text-4xl font-bold text-maroon mt-2">What Our Guests Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <p className="font-semibold text-maroon text-sm">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 bg-luxury text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl font-bold mb-4">Book Your Experience Tonight</h2>
          <p className="text-white/70 mb-8 text-lg">
            Join us for an evening you won't forget. Reservations recommended.
          </p>
          <Link
            to="/reservations"
            className="inline-flex items-center gap-2 bg-gold text-maroon px-10 py-4 rounded-lg font-semibold hover:bg-gold-light transition-colors text-sm tracking-wide"
          >
            Reserve Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
