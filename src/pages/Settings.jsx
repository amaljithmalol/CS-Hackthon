import { useState } from 'react'
import {
  AlertCircle,
  Bell,
  Database,
  Eye,
  KeyRound,
  LogOut,
  MapPin,
  Palette,
  RefreshCcw,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import { Card, Divider, SectionHeading } from '../components/Card'
import { PasswordInput } from '../components/Input'
import { ConfirmDialog } from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { changePassword } from '../services/auth'
import { resetDb } from '../services/db'
import { clearStore } from '../utils/storage'
import { validators } from '../utils/validation'
import { cn } from '../utils/cn'
import { ROLE_LABELS } from '../utils/constants'
import { roleHome } from '../utils/dashNav'

const PREFERENCES_KEY = 'preferences'

const DEFAULTS = {
  emailDonationAlerts: true,
  emailRequestAlerts: true,
  emailPickupAlerts: true,
  emailImpactSummary: false,
  inAppSounds: true,
  compactCards: false,
  showDistance: true,
}

const ROLES = [
  {
    id: 'hotel',
    label: 'Hotel / Restaurant',
    body: 'Post surplus food, track requests and see who collected it.',
  },
  { id: 'ngo', label: 'NGO', body: 'Request food, assign volunteers and record beneficiaries.' },
  {
    id: 'volunteer',
    label: 'Volunteer',
    body: 'Accept pickup tasks, follow routes and confirm delivery.',
  },
  { id: 'admin', label: 'Admin', body: 'Verify partners, monitor donations and resolve reports.' },
]

export default function Settings() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const [preferences, setPreferences] = useState(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(`foodbridge:${PREFERENCES_KEY}`) ?? '{}') }
    } catch {
      return DEFAULTS
    }
  })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [savingPassword, setSavingPassword] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [deletingOpen, setDeletingOpen] = useState(false)
  const [resetting, setResetting] = useState(false)

  if (!user) return null

  const togglePreference = (key) => {
    setPreferences((current) => {
      const next = { ...current, [key]: !current[key] }
      try {
        localStorage.setItem(`foodbridge:${PREFERENCES_KEY}`, JSON.stringify(next))
      } catch {
        /* storage unavailable */
      }
      return next
    })
  }

  const handlePassword = async (event) => {
    event.preventDefault()
    const errors = {
      current: validators.required(passwords.current, 'Please enter your current password.'),
      next:
        validators.required(passwords.next, 'Please enter a new password.') ||
        validators.minLength(passwords.next, 8, 'Password must be at least 8 characters.'),
      confirm: validators.match(passwords.confirm, passwords.next),
    }
    setPasswordErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    setSavingPassword(true)
    try {
      await changePassword(passwords)
      setPasswords({ current: '', next: '', confirm: '' })
      toast.success('Your password has been updated.', { title: 'Password changed' })
    } catch (error) {
      toast.error(error?.message ?? 'We could not change your password.')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      resetDb()
      toast.success('Demo data has been reset to its original state.', { title: 'Demo reset' })
      setResetOpen(false)
    } finally {
      setResetting(false)
    }
  }

  const handleDelete = async () => {
    clearStore()
    await logout().catch(() => {})
    setDeletingOpen(false)
    window.location.href = '/'
  }

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Control notifications, accessibility and how FoodBridge behaves on this device."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Settings' }]}
      />

      <div className="container-page grid gap-6 py-10 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {/* notifications */}
          <Card className="p-6 sm:p-7">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Bell className="h-5 w-5 text-brand-600" aria-hidden="true" />
              Notification preferences
            </h2>
            <p className="mt-1 text-sm text-forest-600">
              Choose which updates you receive. In-app notifications are always shown in your bell menu.
            </p>
            <Divider className="my-5" />
            <ul className="space-y-4">
              {[
                { key: 'emailDonationAlerts', label: 'New donations nearby', description: 'When a nearby partner posts surplus food.' },
                { key: 'emailRequestAlerts', label: 'Donation requests', description: 'When an NGO or volunteer claims one of your donations.' },
                { key: 'emailPickupAlerts', label: 'Pickup updates', description: 'Assigned, collected and delivered status changes.' },
                { key: 'emailImpactSummary', label: 'Monthly impact summary', description: 'A monthly recap of the meals you rescued.' },
              ].map((item) => (
                <li key={item.key} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-forest-800">{item.label}</p>
                    <p className="mt-0.5 text-xs text-forest-500">{item.description}</p>
                  </div>
                  <Toggle
                    checked={preferences[item.key]}
                    onChange={() => togglePreference(item.key)}
                    label={item.label}
                  />
                </li>
              ))}
            </ul>
          </Card>

          {/* appearance */}
          <Card className="p-6 sm:p-7">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Palette className="h-5 w-5 text-brand-600" aria-hidden="true" />
              Appearance and accessibility
            </h2>
            <p className="mt-1 text-sm text-forest-600">
              FoodBridge respects your device settings automatically. You can fine-tune the in-app experience
              here.
            </p>
            <Divider className="my-5" />
            <ul className="space-y-4">
              <li className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-forest-800">Compact donation cards</p>
                  <p className="mt-0.5 text-xs text-forest-500">Show more results per screen.</p>
                </div>
                <Toggle
                  checked={preferences.compactCards}
                  onChange={() => togglePreference('compactCards')}
                  label="Compact donation cards"
                />
              </li>
              <li className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-forest-800">Show distance on listings</p>
                  <p className="mt-0.5 text-xs text-forest-500">Display how far each pickup point is from you.</p>
                </div>
                <Toggle
                  checked={preferences.showDistance}
                  onChange={() => togglePreference('showDistance')}
                  label="Show distance on listings"
                />
              </li>
              <li className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-forest-800">In-app sounds</p>
                  <p className="mt-0.5 text-xs text-forest-500">Play a short tone on new pickup updates.</p>
                </div>
                <Toggle
                  checked={preferences.inAppSounds}
                  onChange={() => togglePreference('inAppSounds')}
                  label="In-app sounds"
                />
              </li>
            </ul>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2.5 rounded-xl bg-forest-50 p-4 text-sm text-forest-700">
                <Eye className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span>
                  Your system currently requests{' '}
                  <strong>{prefersDark ? 'dark' : 'light'}</strong> colour mode and{' '}
                  <strong>{prefersReducedMotion ? 'reduced' : 'full'}</strong> motion.
                </span>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-forest-50 p-4 text-sm text-forest-700">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span>Animations are disabled automatically when reduced motion is requested.</span>
              </div>
            </div>
          </Card>

          {/* password */}
          <Card className="p-6 sm:p-7">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <KeyRound className="h-5 w-5 text-brand-600" aria-hidden="true" />
              Change password
            </h2>
            <p className="mt-1 text-sm text-forest-600">
              Use at least 8 characters. A mix of letters, numbers and symbols is strongest.
            </p>
            <Divider className="my-5" />
            <form onSubmit={handlePassword} noValidate className="grid gap-4 sm:grid-cols-2">
              <PasswordInput
                label="Current password"
                name="current_password"
                autoComplete="current-password"
                wrapperClassName="sm:col-span-2"
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                error={passwordErrors.current}
              />
              <PasswordInput
                label="New password"
                name="new_password"
                autoComplete="new-password"
                value={passwords.next}
                onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                error={passwordErrors.next}
              />
              <PasswordInput
                label="Confirm new password"
                name="confirm_password"
                autoComplete="new-password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                error={passwordErrors.confirm}
              />
              <div className="flex justify-end sm:col-span-2">
                <Button type="submit" loading={savingPassword}>
                  Update password
                </Button>
              </div>
            </form>
          </Card>

          {/* data */}
          <Card className="p-6 sm:p-7">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Database className="h-5 w-5 text-brand-600" aria-hidden="true" />
              Data and demo controls
            </h2>
            <p className="mt-1 text-sm text-forest-600">
              This build stores everything in your browser. You can restore the original demo data or clear
              the local database entirely.
            </p>
            <Divider className="my-5" />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={() => setResetOpen(true)}>
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Reset demo data
              </Button>
              <Button variant="danger" onClick={() => setDeletingOpen(true)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete local data
              </Button>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs text-forest-500">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-soft-600" aria-hidden="true" />
              Resetting restores the original donations, users and messages. Deleting removes everything
              stored by FoodBridge in this browser and signs you out.
            </p>
          </Card>
        </div>

        {/* sidebar */}
        <aside className="space-y-5">
          <Card className="p-5 text-center">
            <div className="flex justify-center">
              <Avatar name={user.organization_name ?? user.name} size="lg" />
            </div>
            <p className="mt-3 text-sm font-semibold">{user.organization_name ?? user.name}</p>
            <p className="text-xs text-forest-500">{ROLE_LABELS[user.role]}</p>
            <Button to={roleHome[user.role] ?? '/dashboard'} variant="subtle" size="sm" className="mt-4 w-full">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              My dashboard
            </Button>
          </Card>

          <Card className="p-5">
            <SectionHeading
              eyebrow="Your role"
              title={ROLE_LABELS[user.role]}
              description={ROLES.find((r) => r.id === user.role)?.body}
              align="left"
            />
            <ul className="mt-4 space-y-2 text-sm">
              {ROLES.map((role) => (
                <li
                  key={role.id}
                  className={cn(
                    'rounded-xl border p-3',
                    role.id === user.role
                      ? 'border-brand-400 bg-brand-50 text-brand-800'
                      : 'border-forest-100 text-forest-500',
                  )}
                >
                  <p className="text-sm font-semibold">{role.label}</p>
                  <p className="mt-0.5 text-xs">{role.body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-forest-500">
              Roles are assigned during admin verification and cannot be changed here.
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold">Session</h3>
            <p className="mt-1.5 text-sm text-forest-600">
              You are signed in as <span className="font-medium text-forest-800">{user.email}</span>.
            </p>
            <Button
              variant="danger"
              className="mt-4 w-full"
              onClick={async () => {
                await logout()
                window.location.href = '/'
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        loading={resetting}
        title="Reset demo data?"
        confirmLabel="Reset data"
        message="This restores the original demo donations, users, messages and reports. Anything you created in this browser will be lost."
      />

      <ConfirmDialog
        open={deletingOpen}
        onClose={() => setDeletingOpen(false)}
        onConfirm={handleDelete}
        tone="danger"
        confirmLabel="Delete everything"
        message="This permanently removes all FoodBridge data stored in this browser, including your account, and signs you out."
      />
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition',
        checked ? 'bg-brand-600' : 'bg-forest-200',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow-soft transition',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
