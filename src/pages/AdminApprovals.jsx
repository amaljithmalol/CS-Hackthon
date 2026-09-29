import { useMemo, useState } from 'react'
import { Building2, CheckCircle2, FileText, ShieldCheck, ShieldX, XCircle } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import Badge, { VerifiedBadge } from '../components/Badge'
import { Card, EmptyState, SectionHeading } from '../components/Card'
import { ConfirmDialog } from '../components/Modal'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../context/ToastContext'
import { getApprovals, setVerification } from '../services/users'
import { adminNav } from '../utils/dashNav'
import { formatDate } from '../utils/formatDate'
import { cn } from '../utils/cn'
import { EMPTY_LIST } from '../utils/constants'

const FILTERS = [
  { id: 'pending', label: 'Pending' },
  { id: 'verified', label: 'Verified' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
]

export default function AdminApprovals() {
  const toast = useToast()
  const [filter, setFilter] = useState('pending')
  const [decision, setDecision] = useState(null)
  const [busy, setBusy] = useState(false)
  const { data, loading, error, reload, setData } = useAsync(() => getApprovals(), [])

  const organizations = data?.organizations ?? EMPTY_LIST

  const counts = useMemo(
    () =>
      FILTERS.reduce((acc, item) => {
        acc[item.id] =
          item.id === 'all'
            ? organizations.length
            : organizations.filter((o) => o.verification_status === item.id).length
        return acc
      }, {}),
    [organizations],
  )

  const visible = useMemo(
    () => (filter === 'all' ? organizations : organizations.filter((o) => o.verification_status === filter)),
    [organizations, filter],
  )

  const apply = async (status) => {
    setBusy(true)
    try {
      const result = await setVerification(decision.org.id, status)
      setData((current) => ({
        ...current,
        organizations: current.organizations.map((o) =>
          o.id === decision.org.id ? { ...o, ...result.organization } : o,
        ),
      }))
      toast.success(
        status === 'verified'
          ? `${decision.org.organization_name} is now verified and can use the platform.`
          : status === 'rejected'
            ? `${decision.org.organization_name} has been rejected. They have been notified.`
            : `${decision.org.organization_name} was moved back to pending review.`,
      )
      setDecision(null)
    } catch (err) {
      toast.error(err?.message ?? 'We could not update the verification status.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardLayout
      title="Approvals"
      subtitle={`${counts.pending ?? 0} organisation${counts.pending === 1 ? '' : 's'} awaiting review`}
      nav={adminNav}
    >
      <Card className="p-5">
        <SectionHeading
          align="left"
          eyebrow="Verification"
          title="Review partner organisations"
          description="Verified hotels, NGOs and volunteers can post, request and collect food. Check the submitted details before approving."
        />
        <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Filter by verification status">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition',
                filter === item.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-forest-50 text-forest-600 hover:bg-forest-100',
              )}
            >
              {item.label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-[10px] font-bold',
                  filter === item.id ? 'bg-white/20' : 'bg-forest-200/70 text-forest-700',
                )}
              >
                {counts[item.id] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState className="mt-6" message={error} onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={ShieldCheck}
          title={filter === 'pending' ? 'Nothing awaiting review' : `No ${filter} organisations`}
          description={
            filter === 'pending'
              ? 'Every organisation has been reviewed. New sign-ups will appear here automatically.'
              : 'Try a different status filter.'
          }
        />
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((org) => (
            <li key={org.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <Avatar name={org.organization_name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-base font-semibold text-forest-900">
                      {org.organization_name}
                      {org.verification_status === 'verified' ? (
                        <VerifiedBadge status="verified" label="" className="shrink-0" />
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-sm text-forest-500">
                      {org.user?.name} · {org.user?.email}
                    </p>
                    <p className="mt-0.5 text-sm text-forest-500">
                      {org.user?.phone} · {org.address}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone="neutral" icon={Building2}>
                        {org.organization_type}
                      </Badge>
                      <Badge
                        tone={
                          org.verification_status === 'verified'
                            ? 'success'
                            : org.verification_status === 'rejected'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        <span className="capitalize">{org.verification_status}</span>
                      </Badge>
                      <span className="text-xs text-forest-400">
                        Applied {formatDate(org.created_at)}
                        {org.reviewed_at ? ` · reviewed ${formatDate(org.reviewed_at)}` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {org.verification_status !== 'verified' ? (
                      <Button size="sm" onClick={() => setDecision({ org, status: 'verified' })}>
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Verify
                      </Button>
                    ) : null}
                    {org.verification_status !== 'rejected' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDecision({ org, status: 'rejected' })}
                      >
                        <ShieldX className="h-4 w-4" aria-hidden="true" />
                        Reject
                      </Button>
                    ) : null}
                    {org.verification_status !== 'pending' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDecision({ org, status: 'pending' })}
                      >
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        Reopen
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(decision)}
        onClose={() => setDecision(null)}
        onConfirm={() => apply(decision.status)}
        loading={busy}
        tone={decision?.status === 'rejected' ? 'danger' : 'primary'}
        title={
          decision?.status === 'verified'
            ? 'Verify this organisation?'
            : decision?.status === 'rejected'
              ? 'Reject this organisation?'
              : 'Move back to pending?'
        }
        confirmLabel={
          decision?.status === 'verified' ? 'Verify' : decision?.status === 'rejected' ? 'Reject' : 'Move to pending'
        }
        message={
          decision
            ? decision.status === 'verified'
              ? `${decision.org.organization_name} will be able to post and request donations immediately. They will be notified.`
              : decision.status === 'rejected'
                ? `${decision.org.organization_name} will not be able to post donations. They will be notified so they can resubmit their documents.`
                : `${decision.org.organization_name} will move back into the pending queue for another review.`
            : ''
        }
      />

      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-forest-500">
        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
        Verifying an organisation updates their account status and notifies them automatically.
      </p>
    </DashboardLayout>
  )
}
