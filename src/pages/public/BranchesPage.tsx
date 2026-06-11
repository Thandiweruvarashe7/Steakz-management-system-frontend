import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { STATIC_BRANCHES } from '@/constants/nav'

const CITIES = ['All', ...Array.from(new Set(STATIC_BRANCHES.map((b) => b.city)))]

const HOURS: Record<string, string> = {
  Monday: '12:00 – 22:00',
  Tuesday: '12:00 – 22:00',
  Wednesday: '12:00 – 22:00',
  Thursday: '12:00 – 23:00',
  Friday: '12:00 – 23:30',
  Saturday: '11:00 – 23:30',
  Sunday: '11:00 – 21:00',
}

export function BranchesPage() {
  const [city, setCity] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return STATIC_BRANCHES.filter((b) => {
      const matchCity = city === 'All' || b.city === city
      const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.city.toLowerCase().includes(search.toLowerCase())
      return matchCity && matchSearch
    })
  }, [city, search])

  return (
    <div className="bg-beige-light min-h-screen">
      <div className="bg-luxury py-16 text-center px-4">
        <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Find Us</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">Our Branches</h1>
        <p className="text-white/70 max-w-xl mx-auto">
          Four iconic locations across the United Kingdom, each delivering the same extraordinary STEAKZ experience.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  city === c ? 'bg-maroon text-white border-maroon' : 'bg-white text-gray-600 border-gray-200 hover:border-maroon hover:text-maroon'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search branches..." className="sm:w-64 ml-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filtered.map((branch) => (
            <div key={branch.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-maroon to-maroon-dark flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin className="w-10 h-10 text-gold mx-auto mb-2" />
                  <p className="font-serif text-2xl font-bold">{branch.city}</p>
                </div>
              </div>
              <div className="p-6">
                <h2 className="font-serif text-xl font-bold text-maroon mb-3">{branch.name}</h2>
                <p className="text-gray-500 text-sm mb-4">{branch.description}</p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-maroon mt-0.5 flex-shrink-0" />
                    <span>{branch.address}, {branch.city}, {branch.postcode}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-maroon flex-shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-maroon flex-shrink-0" />
                    <span>{branch.email}</span>
                  </div>
                </div>

                {/* Hours */}
                <div className="border-t border-gray-100 pt-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-maroon" />
                    <span className="text-sm font-medium text-maroon">Opening Hours</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {Object.entries(HOURS).map(([day, time]) => (
                      <div key={day} className="flex justify-between text-xs text-gray-500">
                        <span>{day.slice(0, 3)}</span>
                        <span>{time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/reservations?branch=${branch.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-maroon text-white py-3 rounded-lg font-medium hover:bg-maroon-dark transition-colors text-sm"
                >
                  Book at this Branch <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
