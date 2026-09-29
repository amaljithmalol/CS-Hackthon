import { motion } from 'framer-motion'
import { ArrowRight, Compass, Home, Leaf, MapPin, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Logo from '../components/Logo'
import { useState } from 'react'

const QUICK_LINKS = [
  { label: 'Browse donations', to: '/donations', icon: Search },
  { label: 'Open the food map', to: '/map', icon: MapPin },
  { label: 'Our impact', to: '/impact', icon: Leaf },
  { label: 'Food safety', to: '/food-safety', icon: Compass },
]

export default function NotFound() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (event) => {
    event.preventDefault()
    navigate(query.trim() ? `/donations?search=${encodeURIComponent(query.trim())}` : '/donations')
  }

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-xl"
      >
        <Logo className="mx-auto w-fit" />
        <p className="mt-8 text-7xl font-bold tracking-tight text-brand-200 sm:text-8xl">404</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">We could not find that page</h1>
        <p className="mt-4 text-base leading-relaxed text-forest-600">
          The link may be broken, or the page may have moved. Try searching for available food, or head
          back to the home page.
        </p>

        <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-md gap-2">
          <label htmlFor="notfound-search" className="sr-only">
            Search donations
          </label>
          <input
            id="notfound-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for biriyani, bakery, NGO…"
            className="input-base py-3"
          />
          <Button type="submit">Search</Button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button to="/">
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Button>
          <Button to="/donations" variant="outline">
            Browse donations
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-10">
          <p className="text-xs font-semibold tracking-wide text-forest-400 uppercase">Popular pages</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-2 rounded-xl border border-forest-200 px-3.5 py-2 text-sm font-medium text-forest-700 transition hover:border-brand-300 hover:bg-brand-50"
                  >
                    <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
