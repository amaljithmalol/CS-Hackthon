import { useMemo, useState } from 'react'
import { Bell, CheckCheck, Inbox, Settings2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { Card, EmptyState } from '../components/Card'
import { NotificationRow } from '../components/Notification'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../context/ToastContext'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notifications'
import { cn } from '../utils/cn'
import { EMPTY_LIST } from '../utils/constants'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'donation', label: 'Donations' },
  { id: 'pickup', label: 'Pickups' },
  { id: 'task', label: 'Tasks' },
  { id: 'approval', label: 'Approvals' },
]

const GROUPS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'older', label: 'Earlier' },
]

function bucketFor(createdAt) {
  const diff = Date.now() - new Date(createdAt).getTime()
  const day = 24 * 60 * 60 * 1000
  if (diff < day) return 'today'
  if (diff < 7 * day) return 'week'
  return 'older'
}

export default function Notifications() {
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const { data, loading, error, reload, setData } = useAsync(() => getNotifications(), [])

  const notifications = data?.notifications ?? EMPTY_LIST
  const unread = data?.unread ?? 0

  const visible = useMemo(() => {
    if (filter === 'all') return notifications
    if (filter === 'unread') return notifications.filter((n) => !n.read)
    return notifications.filter((n) => n.type === filter)
  }, [notifications, filter])

  const grouped = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        items: visible.filter((n) => bucketFor(n.created_at) === group.id),
      })).filter((group) => group.items.length > 0),
    [visible],
  )

  const handleRead = async (item) => {
    if (item.read) return
    setData((current) => ({
      ...current,
      unread: Math.max(0, (current?.unread ?? 1) - 1),
      notifications: current.notifications.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
    }))
    try {
      await markNotificationRead(item.id)
    } catch {
      reload()
    }
  }

  const handleReadAll = async () => {
    setData((current) => ({
      ...current,
      unread: 0,
      notifications: current.notifications.map((n) => ({ ...n, read: true })),
    }))
    try {
      await markAllNotificationsRead()
      toast.success('All notifications marked as read.')
    } catch {
      reload()
      toast.error('We could not mark your notifications as read.')
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Updates"
        title="Notifications"
        description={
          unread
            ? `${unread} unread update${unread > 1 ? 's' : ''} waiting for you.`
            : 'You are all caught up.'
        }
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Notifications' }]}
        action={
          <div className="flex gap-3">
            <Button to="/settings" variant="outline">
              <Settings2 className="h-4 w-4" aria-hidden="true" />
              Preferences
            </Button>
            {unread ? (
              <Button onClick={handleReadAll}>
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
                Mark all read
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="container-page py-8">
        <div
          className="mb-6 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter notifications"
        >
          {FILTERS.map((option) => {
            const count =
              option.id === 'all'
                ? notifications.length
                : option.id === 'unread'
                  ? notifications.filter((n) => !n.read).length
                  : notifications.filter((n) => n.type === option.id).length
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                aria-pressed={filter === option.id}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition',
                  filter === option.id
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-forest-200 bg-white text-forest-600 hover:border-brand-300',
                )}
              >
                {option.label}
                <span className="rounded-full bg-forest-100 px-1.5 text-[10px] font-bold text-forest-700">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={filter === 'unread' ? 'Nothing unread' : 'No notifications here yet'}
            description="Donation requests, pickup updates, tasks and approvals will appear here as they happen."
            action={
              filter === 'all' ? (
                <Button to="/donations" variant="outline">
                  Browse donations
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setFilter('all')}>
                  Show all notifications
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <section key={group.id} aria-label={group.label}>
                <h2 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wide text-forest-400 uppercase">
                  <span className="h-px flex-1 bg-forest-100" />
                  {group.label}
                  <span className="h-px flex-1 bg-forest-100" />
                </h2>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <NotificationRow item={item} onRead={handleRead} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <Card className="mt-8 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5 text-sm text-forest-600">
            <Bell className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            Notifications are generated whenever a donation you are part of changes status.
          </p>
          <Badge tone="neutral">
            {notifications.length} total · {unread} unread
          </Badge>
        </Card>
      </div>
    </div>
  )
}
