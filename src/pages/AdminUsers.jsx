import { useMemo, useState } from 'react'
import {
  Building2,
  HandHeart,
  HeartHandshake,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import Badge, { VerifiedBadge } from '../components/Badge'
import { Card, EmptyState } from '../components/Card'
import { ConfirmDialog, Modal } from '../components/Modal'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { deleteUser, getUsers, updateUser } from '../services/users'
import { adminNav } from '../utils/dashNav'
import { EMPTY_LIST, ROLE_LABELS } from '../utils/constants'
import { formatDate } from '../utils/formatDate'
import { cn } from '../utils/cn'

const ROLES = ['hotel', 'ngo', 'volunteer', 'admin']
const STATUSES = ['verified', 'pending', 'rejected']

const ROLE_TONE = {
  hotel: 'amber',
  ngo: 'brand',
  volunteer: 'info',
  admin: 'neutral',
}

const ROLE_ICON = {
  hotel: UtensilsCrossed,
  ngo: HeartHandshake,
  volunteer: HandHeart,
  admin: ShieldCheck,
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data, loading, error, reload, setData } = useAsync(() => getUsers(), [])
  const all = data?.users ?? EMPTY_LIST

  const filtered = useMemo(
    () =>
      all
        .filter((u) => (role === 'all' ? true : u.role === role))
        .filter((u) => (status === 'all' ? true : u.verification_status === status))
        .filter((u) =>
          query
            ? [u.name, u.email, u.area, u.phone, u.organization_name]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(query.toLowerCase()))
            : true,
        ),
    [all, role, status, query],
  )

  const counts = useMemo(
    () => ({
      all: all.length,
      ...ROLES.reduce((acc, r) => ({ ...acc, [r]: all.filter((u) => u.role === r).length }), {}),
      pending: all.filter((u) => u.verification_status === 'pending').length,
    }),
    [all],
  )

  const handleSave = async (payload) => {
    setBusy(true)
    try {
      const result = await updateUser(editing.id, payload)
      setData((current) => ({
        ...current,
        users: current.users.map((u) => (u.id === editing.id ? { ...u, ...result.user } : u)),
      }))
      toast.success(`${result.user.name} has been updated.`)
      setEditing(null)
    } catch (err) {
      toast.error(err?.message ?? 'We could not update that user.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      await deleteUser(removing.id)
      setData((current) => ({
        ...current,
        users: current.users.filter((u) => u.id !== removing.id),
        total: Math.max(0, (current.total ?? 1) - 1),
      }))
      toast.info(`${removing.name} has been removed from the platform.`)
      setRemoving(null)
    } catch (err) {
      toast.error(err?.message ?? 'We could not remove that account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardLayout
      title="Users & roles"
      subtitle={`${counts.all} members · ${counts.pending} pending verification`}
      nav={adminNav}
    >
      <Card className="p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by role">
            {['all', ...ROLES].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                aria-pressed={role === option}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
                  role === option ? 'bg-brand-600 text-white' : 'bg-forest-50 text-forest-600 hover:bg-forest-100',
                )}
              >
                {option === 'all' ? 'All roles' : ROLE_LABELS[option]}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[10px] font-bold',
                    role === option ? 'bg-white/20' : 'bg-forest-200/70 text-forest-700',
                  )}
                >
                  {counts[option] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-56">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-forest-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email or area"
                aria-label="Search users"
                className="input-base pl-9"
              />
            </div>
            <div className="w-40">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                aria-label="Filter by verification status"
                className="input-base"
              >
                <option value="all">All statuses</option>
                {STATUSES.map((option) => (
                  <option key={option} value={option} className="capitalize">
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState className="mt-6" message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={Users}
          title="No members match your filters"
          description="Try a different role, status or search term."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setRole('all')
                setStatus('all')
                setQuery('')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((member) => {
            const Icon = ROLE_ICON[member.role] ?? Users
            const isSelf = member.id === currentUser?.id
            return (
              <li key={member.id}>
                <Card className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                  <Avatar name={member.organization_name ?? member.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-semibold text-forest-900">
                      {member.organization_name ?? member.name}
                      {member.verification_status === 'verified' ? (
                        <VerifiedBadge status="verified" label="" className="shrink-0" />
                      ) : null}
                      {isSelf ? <Badge tone="info">You</Badge> : null}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-forest-500">
                      {member.name}
                      {member.organization_name ? ` · ${member.name}` : ''} · {member.area}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-forest-500">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" aria-hidden="true" />
                        {member.email}
                      </span>
                      {member.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" aria-hidden="true" />
                          {member.phone}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3 w-3" aria-hidden="true" />
                        Joined {formatDate(member.created_at)}
                      </span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={ROLE_TONE[member.role]} icon={Icon}>
                      {ROLE_LABELS[member.role]}
                    </Badge>
                    <Badge
                      tone={
                        member.verification_status === 'verified'
                          ? 'success'
                          : member.verification_status === 'rejected'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      <span className="capitalize">{member.verification_status}</span>
                    </Badge>
                    <Button size="sm" variant="subtle" onClick={() => setEditing(member)}>
                      <UserCog className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                    {!isSelf ? (
                      <Button size="sm" variant="ghost" onClick={() => setRemoving(member)}>
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Remove {member.name}</span>
                      </Button>
                    ) : null}
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      <EditUserModal
        member={editing}
        loading={busy}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleDelete}
        loading={busy}
        tone="danger"
        title="Remove this account?"
        confirmLabel="Remove account"
        message={
          removing
            ? `${removing.organization_name ?? removing.name} will lose access to FoodBridge immediately. Their donation history is kept for reporting.`
            : ''
        }
      />
    </DashboardLayout>
  )
}

function EditUserModal({ member, loading, onClose, onSave }) {
  const [values, setValues] = useState({})

  const current = member ? { ...member, ...values } : null

  const set = (key) => (event) => setValues((v) => ({ ...v, [key]: event.target.value }))

  return (
    <Modal
      open={Boolean(member)}
      onClose={() => {
        setValues({})
        onClose()
      }}
      title="Edit member"
      description={member ? `Update the role, verification or contact details for ${member.name}.` : ''}
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              setValues({})
              onClose()
            }}
          >
            Cancel
          </Button>
          <Button
            loading={loading}
            onClick={() => {
              onSave({
                role: current.role,
                verification_status: current.verification_status,
                verified: current.verification_status === 'verified',
                phone: current.phone,
                area: current.area,
              })
              setValues({})
            }}
          >
            Save changes
          </Button>
        </>
      }
    >
      {current ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-forest-500">Account</p>
            <p className="mt-1 text-sm text-forest-800">
              {current.organization_name ?? current.name} · {current.email}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700" htmlFor="edit-role">
              Role
            </label>
            <select
              id="edit-role"
              value={current.role}
              onChange={set('role')}
              className="input-base mt-1.5"
            >
              {ROLES.map((option) => (
                <option key={option} value={option}>
                  {ROLE_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700" htmlFor="edit-status">
              Verification
            </label>
            <select
              id="edit-status"
              value={current.verification_status}
              onChange={set('verification_status')}
              className="input-base mt-1.5 capitalize"
            >
              {STATUSES.map((option) => (
                <option key={option} value={option} className="capitalize">
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700" htmlFor="edit-phone">
              Phone
            </label>
            <input
              id="edit-phone"
              value={current.phone ?? ''}
              onChange={set('phone')}
              className="input-base mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-forest-700" htmlFor="edit-area">
              Area
            </label>
            <input
              id="edit-area"
              value={current.area ?? ''}
              onChange={set('area')}
              className="input-base mt-1.5"
            />
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
