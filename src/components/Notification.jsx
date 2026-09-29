import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CheckCheck, PackageCheck, ShieldCheck, Sparkles, Truck, UtensilsCrossed, X } from 'lucide-react'
import { useAsync } from '../hooks/useAsync'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notifications'
import { cn } from '../utils/cn'
import { timeAgo } from '../utils/formatDate'
import { EMPTY_LIST } from '../utils/constants'

const TYPE_ICON = {
  donation: UtensilsCrossed,
  request: PackageCheck,
  pickup: Truck,
  completed: Sparkles,
  task: Truck,
  approval: ShieldCheck,
  report: ShieldCheck,
  impact: Sparkles,
  message: Bell,
  system: Bell,
}

const TONE = {
  donation: 'bg-brand-50 text-brand-600',
  request: 'bg-warning-50 text-warning-700',
  pickup: 'bg-amber-soft-50 text-amber-soft-600',
  completed: 'bg-success-50 text-success-700',
  task: 'bg-info-50 text-info-700',
  approval: 'bg-forest-50 text-forest-600',
  report: 'bg-danger-50 text-danger-500',
  impact: 'bg-success-50 text-success-700',
  message: 'bg-info-50 text-info-700',
}

export default function NotificationBell({ className }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const { data, loading, setData, reload } = useAsync(() => getNotifications(), [])

  const notifications = data?.notifications ?? EMPTY_LIST
  const unread = data?.unread ?? 0

  useEffect(() => {
    if (!open) return undefined
    const onClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleRead = useCallback(
    async (item) => {
      if (item.read) return
      setData((current) => ({
        ...current,
        unread: Math.max(0, (current?.unread ?? 1) - 1),
        notifications: current.notifications.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      }))
      await markNotificationRead(item.id).catch(() => reload())
    },
    [setData, reload],
  )

  const handleReadAll = useCallback(async () => {
    setData((current) => ({
      ...current,
      unread: 0,
      notifications: current.notifications.map((n) => ({ ...n, read: true })),
    }))
    await markAllNotificationsRead().catch(() => reload())
  }, [setData, reload])

  return (
    <div className={cn('relative', className)} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-forest-600 transition hover:bg-forest-50 hover:text-forest-900"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        <AnimatePresence>
          {unread > 0 ? (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-soft-500 px-1 text-[10px] font-bold text-white"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-lift"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between border-b border-forest-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Notifications</p>
                <p className="text-xs text-forest-500">
                  {unread ? `${unread} unread update${unread > 1 ? 's' : ''}` : 'You are all caught up'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {unread ? (
                  <button
                    type="button"
                    onClick={handleReadAll}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
                  >
                    Mark all read
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-forest-400 transition hover:bg-forest-50"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="skeleton h-14 w-full" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <Bell className="mx-auto h-8 w-8 text-forest-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-forest-700">No notifications yet</p>
                  <p className="mt-1 text-xs text-forest-500">
                    Donations, pickups and updates will appear here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-forest-50">
                  {notifications.map((item) => {
                    const Icon = TYPE_ICON[item.type] ?? Bell
                    return (
                      <li key={item.id}>
                        <Link
                          to={item.link ?? '#'}
                          onClick={() => {
                            handleRead(item)
                            setOpen(false)
                          }}
                          className={cn(
                            'flex gap-3 px-4 py-3 transition hover:bg-forest-50',
                            !item.read && 'bg-brand-50/40',
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                              TONE[item.type] ?? TONE.system,
                            )}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className={cn('truncate text-sm', item.read ? 'font-medium text-forest-700' : 'font-semibold text-forest-900')}>
                                {item.title}
                              </span>
                              {!item.read ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" /> : null}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-forest-600">{item.message}</span>
                            <span className="mt-1 block text-[11px] text-forest-400">{timeAgo(item.created_at)}</span>
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {notifications.length ? (
              <div className="border-t border-forest-100 bg-forest-50/60 px-4 py-2.5">
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  View all notifications
                </Link>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export function NotificationRow({ item, onRead }) {
  const Icon = TYPE_ICON[item.type] ?? Bell
  return (
    <Link
      to={item.link ?? '#'}
      onClick={() => onRead?.(item)}
      className={cn(
        'flex gap-4 rounded-xl border border-forest-100 bg-white p-4 transition hover:border-brand-200 hover:shadow-soft',
        !item.read && 'border-brand-200 bg-brand-50/40',
      )}
    >
      <span
        className={cn(
          'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          TONE[item.type] ?? TONE.system,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-forest-900">{item.title}</span>
          {!item.read ? <span className="h-2 w-2 rounded-full bg-brand-500" aria-label="Unread" /> : null}
        </span>
        <span className="mt-1 block text-sm text-forest-600">{item.message}</span>
        <span className="mt-1.5 block text-xs text-forest-400">{timeAgo(item.created_at)}</span>
      </span>
    </Link>
  )
}
