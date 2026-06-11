import { Award, Leaf, Users, Heart } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="bg-beige-light min-h-screen">
      <div className="bg-luxury py-20 text-center px-4">
        <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Our Story</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">About STEAKZ UK</h1>
        <p className="text-white/70 max-w-xl mx-auto">
          A passion for the perfect steak, a commitment to exceptional service, and a love for the finer things in life.
        </p>
      </div>

      {/* Founding story */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm">
          <h2 className="font-serif text-3xl font-bold text-maroon mb-6">The Beginning</h2>
          <div className="prose prose-lg text-gray-600 leading-relaxed space-y-4">
            <p>
              STEAKZ UK was founded in 2010 by acclaimed chef Marcus Alderton, who spent over a decade working in the finest steakhouses across London, Buenos Aires and New York. Returning to Britain with a profound understanding of beef—its provenance, ageing, and preparation—he set out to create something truly extraordinary.
            </p>
            <p>
              The first STEAKZ restaurant opened on Berkeley Square in Mayfair with 28 covers and a single, unflinching ambition: to serve the finest steak in Britain. Within six months, it was fully booked every weekend. Within a year, the critics had arrived.
            </p>
            <p>
              Today, STEAKZ operates four prestigious locations across the United Kingdom, each maintaining the exacting standards that earned us our reputation — while remaining unmistakably, warmly, British.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="font-serif text-3xl font-bold text-maroon text-center mb-10">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Award, title: 'Excellence', desc: 'Every cut, every plate, every guest interaction meets the highest possible standard.' },
            { icon: Leaf, title: 'Sustainability', desc: 'We partner with farms that share our commitment to ethical, sustainable farming practices.' },
            { icon: Users, title: 'Community', desc: 'We invest in our teams, our local communities, and the suppliers who make our menus possible.' },
            { icon: Heart, title: 'Passion', desc: 'A genuine love for great food and great hospitality is at the heart of everything we do.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-maroon flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-serif font-bold text-maroon text-lg mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sourcing */}
      <section className="bg-maroon text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold mb-6">Our Sourcing Philosophy</h2>
          <p className="text-white/75 leading-relaxed text-lg mb-8">
            We source our beef exclusively from hand-selected farms and estates — 85% British, 15% from our trusted partners in Argentina. All beef is dry-aged on site for a minimum of 28 days, developing the complex, nutty flavours that define the STEAKZ experience.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { value: '85%', label: 'British Sourced' },
              { value: '28+', label: 'Days Dry Aged' },
              { value: '12', label: 'Farm Partners' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-6">
                <div className="text-gold text-3xl font-serif font-bold">{stat.value}</div>
                <div className="text-white/60 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-serif text-3xl font-bold text-maroon text-center mb-10">Awards & Recognition</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { year: '2024', award: 'UK Steakhouse of the Year', body: 'Restaurant Association Awards' },
            { year: '2023', award: 'Best Fine Dining Experience', body: 'London Food & Drink Awards' },
            { year: '2022', award: 'Sustainability in Hospitality', body: 'Sustainable Restaurant Association' },
            { year: '2021', award: 'Top 50 UK Restaurants', body: 'The Sunday Times' },
            { year: '2020', award: 'Best Steak London', body: 'Time Out London' },
            { year: '2019', award: 'Service Excellence Award', body: 'Caterer Awards' },
          ].map((a) => (
            <div key={a.award} className="bg-white rounded-xl p-5 shadow-sm flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{a.year}</p>
                <p className="font-semibold text-maroon text-sm">{a.award}</p>
                <p className="text-xs text-gray-500">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
