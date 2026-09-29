import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import Logo from './Logo'
import Avatar from './Avatar'
import Button from './Button'
import NotificationBell from './Notification'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS } from '../utils/constants'
import { cn } from '../utils/cn'

export default function DashboardLayout({
  title,
  subtitle,
  nav = [],
  actions,
  children,
  wide = false,
}) {
  const { user } = useAuth()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <Sidebar nav={nav} onNavigate={() => setDrawerOpen(false)} />

      <AnimatePresence>
        {drawerOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-forest-950/50 backdrop-blur-[2px] lg:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white lg:hidden"
              aria-label="Dashboard navigation"
            >
              <div className="flex h-16 items-center justify-between border-b border-forest-100 px-5">
                <Logo />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-lg p-2 text-forest-500 hover:bg-forest-50"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="h-[calc(100%-4rem)] overflow-y-auto">
                <SidebarContent nav={nav} onNavigate={() => setDrawerOpen(false)} />
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-forest-100 bg-white/90 backdrop-blur-md">
          <div className={cn('flex h-16 items-center gap-3 px-4 sm:px-6', wide ? '' : 'mx-auto max-w-7xl')}>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-forest-700 transition hover:bg-forest-50 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-forest-900 sm:text-lg">{title}</h1>
              {subtitle ? <p className="hidden truncate text-xs text-forest-500 sm:block">{subtitle}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <NotificationBell className="hidden sm:block" />
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-forest-100 py-1.5 pr-2 pl-1.5 transition hover:border-brand-200 hover:shadow-soft"
                aria-label="Open your profile"
              >
                <Avatar name={user?.organization_name ?? user?.name} size="sm" />
                <span className="hidden text-left md:block">
                  <span className="block max-w-[10rem] truncate text-xs font-semibold text-forest-900">
                    {user?.organization_name ?? user?.name}
                  </span>
                  <span className="block text-[11px] text-forest-500">{user ? ROLE_LABELS[user.role] : ''}</span>
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main
          id="dashboard-content"
          className={cn('px-4 py-6 sm:px-6 sm:py-8', wide ? '' : 'mx-auto max-w-7xl')}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

function Sidebar({ nav, onNavigate }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-forest-100 bg-white lg:block">
      <div className="flex h-16 items-center border-b border-forest-100 px-5">
        <Logo />
      </div>
      <div className="h-[calc(100%-4rem)] overflow-y-auto pb-6">
        <SidebarContent nav={nav} onNavigate={onNavigate} />
      </div>
    </aside>
  )
}

function SidebarContent({ nav, onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const groups = nav.reduce((acc, item) => {
    const key = item.group ?? 'Main'
    acc[key] = acc[key] ? [...acc[key], item] : [item]
    return acc
  }, {})

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="space-y-5 px-3 py-5" aria-label="Dashboard">
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <p className="px-3 pb-2 text-[11px] font-bold tracking-[0.12em] text-forest-400 uppercase">{group}</p>
          <ul className="space-y-0.5">
            {items.map((item) => {
              const Icon = item.icon ?? LayoutDashboard
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-forest-600 hover:bg-forest-50 hover:text-forest-900',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive ? (
                          <motion.span
                            layoutId="sidebar-active"
                            className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-500"
                          />
                        ) : null}
                        <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge ? (
                          <span className="rounded-full bg-amber-soft-100 px-2 py-0.5 text-[10px] font-bold text-amber-soft-700">
                            {item.badge}
                          </span>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      <div className="rounded-xl border border-forest-100 bg-forest-50/70 p-4">
        <p className="text-xs font-semibold text-forest-800">
          Signed in as {user?.organization_name ?? user?.name}
        </p>
        <p className="mt-1 text-[11px] text-forest-500">{user ? ROLE_LABELS[user.role] : ''}</p>
        <Button to="/profile" size="sm" variant="subtle" className="mt-3 w-full">
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          View profile
        </Button>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger-600 transition hover:bg-danger-50"
      >
        <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
        Sign out
      </button>
    </nav>
  )
}
