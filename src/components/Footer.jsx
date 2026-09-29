import { Link } from 'react-router-dom'
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react'
import Logo from './Logo'
import { APP } from '../utils/constants'

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { to: '/donations', label: 'Donations' },
      { to: '/map', label: 'Food Map' },
      { to: '/impact', label: 'Impact' },
      { to: '/#how-it-works', label: 'How It Works' },
    ],
  },
  {
    title: 'Community',
    links: [
      { to: '/register?role=hotel', label: 'Hotels & Restaurants' },
      { to: '/register?role=ngo', label: 'NGOs' },
      { to: '/register?role=volunteer', label: 'Volunteers' },
      { to: '/about', label: 'About us' },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/contact', label: 'Contact' },
      { to: '/food-safety', label: 'Food Safety' },
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Use' },
    ],
  },
]

const SOCIALS = [
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
]

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-forest-100 bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-forest-600">
            Connecting surplus food with communities. FoodBridge helps hotels, restaurants, NGOs and
            volunteers redirect safe surplus food to people who need it — reducing waste and building a
            stronger local community.
          </p>
          <div className="mt-5 space-y-2 text-sm text-forest-600">
            <a
              href={`mailto:${APP.email}`}
              className="flex items-center gap-2 transition hover:text-brand-700"
            >
              <Mail className="h-4 w-4 text-brand-600" aria-hidden="true" />
              {APP.email}
            </a>
            <a href={`tel:${APP.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 transition hover:text-brand-700">
              <Phone className="h-4 w-4 text-brand-600" aria-hidden="true" />
              {APP.phone}
            </a>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              {APP.address}
            </p>
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold tracking-wide text-forest-900 uppercase">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-forest-600 transition hover:text-brand-700 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-forest-100">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-center text-xs text-forest-500 sm:text-left">
            © {new Date().getFullYear()} {APP.name}. Built for the community. Demo data is fictional.
          </p>
          <div className="flex items-center gap-2">
            {SOCIALS.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-forest-500 transition hover:bg-brand-50 hover:text-brand-700"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
