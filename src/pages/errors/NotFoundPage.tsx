import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-beige flex flex-col items-center justify-center px-4 text-center">
      <div className="text-9xl font-serif font-bold text-maroon/20 mb-4">404</div>
      <h1 className="text-3xl font-serif font-bold text-maroon mb-3">Page Not Found</h1>
      <p className="text-gray-600 max-w-md mb-8">
        The page you're looking for doesn't exist. Perhaps you'd like to explore our menu or make a reservation.
      </p>
      <div className="flex gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 bg-maroon text-white px-6 py-3 rounded-lg font-medium hover:bg-maroon-dark transition-colors"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Link>
        <Link
          to="/menu"
          className="px-6 py-3 border border-maroon text-maroon rounded-lg font-medium hover:bg-maroon hover:text-white transition-colors"
        >
          View Menu
        </Link>
      </div>
    </div>
  )
}
