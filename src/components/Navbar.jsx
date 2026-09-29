import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LogOut, Menu, Settings, Shield, UserRound, X } from 'lucide-react'
import Logo from './Logo'
import Button from './Button'
import Avatar from './Avatar'
import NotificationBell from './Notification'
import { useAuth } from '../context/AuthContext'
import { homeRouteForRole } from '../services/auth'
import { APP, ROLE_LABELS } from '../utils/constants'
import { cn } from '../utils/cn'

const PUBLIC_LINKS = [
  { to: '/donations', label: 'Donations' },
  { to: '/map', label: 'Food Map' },
  { to: '/impact', label: 'Impact' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const DASHBOARD_LINK = {
  hotel: { to: '/hotel/dashboard', label: 'Hotel Dashboard' },
  ngo: { to: '/ngo/dashboard', label: 'NGO Dashboard' },
  volunteer: { to: '/volunteer/dashboard', label: 'Volunteer Dashboard' },
  admin: { to: '/admin/dashboard', label: 'Admin Panel' },
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const dashboardLink = user ? DASHBOARD_LINK[user.role] : null

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition duration-300',
        scrolled ? 'border-b border-forest-100 bg-white/90 shadow-soft backdrop-blur-md' : 'bg-white/70 backdrop-blur-sm',
      )}
    >
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-18">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {PUBLIC_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-lg px-3.5 py-2 text-sm font-medium transition',
                    isActive ? 'text-brand-700' : 'text-forest-600 hover:bg-forest-50 hover:text-forest-900',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive ? (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-500"
                      />
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NotificationBell className="hidden sm:block" />
                {dashboardLink ? (
                  <Button to={dashboardLink.to} size="sm" variant="subtle" className="hidden md:inline-flex">
                    <Shield className="h-4 w-4" aria-hidden="true" />
                    {dashboardLink.label}
                  </Button>
                ) : null}
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-xl border border-forest-100 bg-white py-1.5 pr-2 pl-1.5 transition hover:border-brand-200 hover:shadow-soft"
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                  >
                    <Avatar name={user.organization_name ?? user.name} size="sm" />
                    <span className="hidden text-left sm:block">
                      <span className="block max-w-[9rem] truncate text-xs font-semibold text-forest-900">
                        {user.organization_name ?? user.name}
                      </span>
                      <span className="block text-[11px] text-forest-500">{ROLE_LABELS[user.role]}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 text-forest-400" aria-hidden="true" />
                  </button>
                  <AnimatePresence>
                    {menuOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-forest-100 bg-white p-1.5 shadow-lift"
                        role="menu"
                      >
                        <div className="px-3 py-2.5">
                          <p className="truncate text-sm font-semibold">{user.name}</p>
                          <p className="truncate text-xs text-forest-500">{user.email}</p>
                        </div>
                        <div className="my-1 h-px bg-forest-100" />
                        <MenuLink to="/profile" icon={UserRound} label="My profile" onNavigate={() => setMenuOpen(false)} />
                        <MenuLink to="/messages" icon={MessageIcon} label="Messages" onNavigate={() => setMenuOpen(false)} />
                        {dashboardLink ? (
                          <MenuLink
                            to={dashboardLink.to}
                            icon={Shield}
                            label={dashboardLink.label}
                            onNavigate={() => setMenuOpen(false)}
                          />
                        ) : null}
                        <MenuLink to="/settings" icon={Settings} label="Settings" onNavigate={() => setMenuOpen(false)} />
                        <div className="my-1 h-px bg-forest-100" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          role="menuitem"
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-danger-600 transition hover:bg-danger-50"
                        >
                          <LogOut className="h-4 w-4" aria-hidden="true" />
                          Sign out
                        </button>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button to="/login" size="sm" variant="ghost">
                  Sign in
                </Button>
                <Button to="/register" size="sm">
                  Join FoodBridge
                </Button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-forest-700 transition hover:bg-forest-50 lg:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-forest-100 bg-white lg:hidden"
          >
            <div className="container-page space-y-1 py-4">
              <nav className="grid gap-1" aria-label="Mobile navigation">
                {PUBLIC_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        'rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                        isActive ? 'bg-brand-50 text-brand-700' : 'text-forest-700 hover:bg-forest-50',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="my-2 h-px bg-forest-100" />

              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 rounded-xl bg-forest-50 p-3">
                    <Avatar name={user.organization_name ?? user.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.organization_name ?? user.name}</p>
                      <p className="truncate text-xs text-forest-500">{ROLE_LABELS[user.role]}</p>
                    </div>
                    <NotificationBell className="ml-auto sm:hidden" />
                  </div>
                  {dashboardLink ? (
                    <Button to={dashboardLink.to} variant="subtle" className="w-full">
                      <Shield className="h-4 w-4" aria-hidden="true" />
                      {dashboardLink.label}
                    </Button>
                  ) : null}
                  <Button to="/profile" variant="ghost" className="w-full justify-start">
                    <UserRound className="h-4 w-4" aria-hidden="true" /> My profile
                  </Button>
                  <Button to="/messages" variant="ghost" className="w-full justify-start">
                    <MessagesIcon className="h-4 w-4" aria-hidden="true" /> Messages
                  </Button>
                  <Button to="/settings" variant="ghost" className="w-full justify-start">
                    <Settings className="h-4 w-4" aria-hidden="true" /> Settings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-danger-600" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
                  </Button>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Button to="/login" variant="outline" className="w-full">
                    Sign in
                  </Button>
                  <Button to="/register" className="w-full">
                    Join FoodBridge
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

function MenuLink({ to, icon: Icon, label, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      role="menuitem"
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-forest-700 transition hover:bg-forest-50"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  )
}

function MessagesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

const MessageIcon = MessagesIcon

export { APP, homeRouteForRole }
