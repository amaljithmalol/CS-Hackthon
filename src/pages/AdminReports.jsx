import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Download, Flag, Inbox, Search, ShieldAlert } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import Badge, { StatusBadge } from '../components/Badge'
import { Card, EmptyState, SectionHeading } from '../components/Card'
import { ConfirmDialog, Modal } from '../components/Modal'
import ErrorState from '../components/ErrorState'
import { Skeleton } from '../components/LoadingSpinner'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../context/ToastContext'
import { getReports, updateReport } from '../services/reports'
import { adminNav } from '../utils/dashNav'
import { formatDateTime, timeAgo } from '../utils/formatDate'
import { exportCsv } from '../utils/share'
import { cn } from '../utils/cn'
import { EMPTY_LIST } from '../utils/constants'

const FILTERS = [
  { id: 'open', label: 'Open' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'all', label: 'All' },
]

const SEVERITY_TONE = { high: 'danger', medium: 'warning', low: 'neutral' }

export default function AdminReports() {
  const toast = useToast()
  const [filter, setFilter] = useState('open')
  const [query, setQuery] = useState('')
  const [inspecting, setInspecting] = useState(null)
  const [resolving, setResolving] = useState(null)
  const [busy, setBusy] = useState(false)
  const { data, loading, error, reload, setData } = useAsync(() => getReports(), [])

  const reports = data?.reports ?? EMPTY_LIST

  const counts = useMemo(
    () => ({
      open: reports.filter((r) => r.status === 'open').length,
      resolved: reports.filter((r) => r.status === 'resolved').length,
      all: reports.length,
    }),
    [reports],
  )

  const visible = useMemo(
    () =>
      reports
        .filter((r) => (filter === 'all' ? true : r.status === filter))
        .filter((r) =>
          query
            ? [r.subject, r.description, r.reporter?.name, r.donation?.food_name]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(query.toLowerCase()))
            : true,
        ),
    [reports, filter, query],
  )

  const resolve = async (status) => {
    setBusy(true)
    try {
      const result = await updateReport(resolving.id, { status })
      setData((current) => ({
        ...current,
        reports: current.reports.map((r) => (r.id === resolving.id ? { ...r, ...result.report } : r)),
      }))
      toast.success(
        status === 'resolved' ? 'Issue marked as resolved.' : 'Issue reopened for review.',
      )
      setResolving(null)
    } catch (err) {
      toast.error(err?.message ?? 'We could not update this issue.')
    } finally {
      setBusy(false)
    }
  }

  const handleExport = () => {
    if (!reports.length) {
      toast.warning('There are no issues to export.')
      return
    }
    exportCsv(
      'foodbridge-reports.csv',
      reports.map((r) => ({
        id: r.id,
        subject: r.subject,
        severity: r.severity,
        status: r.status,
        reported_by: r.reporter?.name,
        donation: r.donation?.food_name,
        created_at: r.created_at,
        resolved_at: r.resolved_at,
      })),
    )
    toast.success('Reports downloaded as CSV.')
  }

  return (
    <DashboardLayout
      title="Reports & issues"
      subtitle={`${counts.open} open · ${counts.all} total`}
      nav={adminNav}
      actions={
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter reports">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition',
                filter === item.id
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-forest-200 bg-white text-forest-600 hover:border-brand-300',
              )}
            >
              {item.label}
              <span className="rounded-full bg-forest-100 px-1.5 text-[10px] font-bold text-forest-700">
                {counts[item.id] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-forest-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues"
            aria-label="Search reports"
            className="input-base pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState className="mt-6" message={error} onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={Inbox}
          title={query ? 'No issues match your search' : 'Nothing here'}
          description={
            query
              ? 'Try a different subject, reporter or donation name.'
              : filter === 'open'
                ? 'No open issues. The community is reporting problems and we are on top of them.'
                : 'Try another filter.'
          }
          action={
            query ? (
              <Button variant="outline" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : (
              <Button to="/donations" variant="outline">
                Browse donations
              </Button>
            )
          }
        />
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((report) => (
            <li key={report.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-forest-900">{report.subject}</h2>
                      <Badge tone={SEVERITY_TONE[report.severity] ?? 'neutral'}>
                        <span className="capitalize">{report.severity}</span>
                      </Badge>
                      <Badge tone={report.status === 'open' ? 'warning' : 'success'}>
                        <span className="capitalize">{report.status}</span>
                      </Badge>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-forest-600">
                      {report.description}
                    </p>
                    <p className="mt-2 text-xs text-forest-500">
                      Reported by <span className="font-medium text-forest-700">{report.reporter?.name ?? 'Unknown'}</span>
                      {report.reporter?.role ? ` (${report.reporter.role})` : ''} · {timeAgo(report.created_at)}
                      {report.donation ? (
                        <>
                          {' · '}
                          <Link
                            to={`/donations/${report.donation.id}`}
                            className="font-medium text-brand-700 hover:underline"
                          >
                            {report.donation.food_name}
                          </Link>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button size="sm" variant="subtle" onClick={() => setInspecting(report)}>
                      View details
                    </Button>
                    {report.status === 'open' ? (
                      <Button size="sm" onClick={() => setResolving({ id: report.id, status: 'resolved' })}>
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Resolve
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setResolving({ id: report.id, status: 'open' })}>
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Card className="mt-6 p-5">
        <SectionHeading
          align="left"
          eyebrow="Moderation"
          title="How issue handling works"
          description="Members can report a donation from its detail page. Everything is tracked here for accountability."
        />
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Flag, title: 'Reported', body: 'A member flags a problem with a donation or partner.' },
            { icon: ShieldAlert, title: 'Investigated', body: 'You review the donation, the partner history and the context.' },
            { icon: CheckCircle2, title: 'Resolved', body: 'You close the issue once it has been put right.' },
          ].map((step) => {
            const Icon = step.icon
            return (
              <li key={step.title} className="rounded-xl border border-forest-100 p-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-danger-50 text-danger-500">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="mt-2 text-sm font-semibold text-forest-900">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-forest-500">{step.body}</p>
              </li>
            )
          })}
        </ul>
        <p className="mt-4 flex items-start gap-2 text-xs text-forest-500">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Severity is set by the reporter. High-severity issues should be reviewed before the pickup window closes.
        </p>
      </Card>

      <Modal
        open={Boolean(inspecting)}
        onClose={() => setInspecting(null)}
        title={inspecting?.subject ?? 'Issue'}
        description="Full report details."
        footer={
          <>
            <Button variant="ghost" onClick={() => setInspecting(null)}>
              Close
            </Button>
            {inspecting?.status === 'open' ? (
              <Button
                onClick={() => {
                  setResolving({ id: inspecting.id, status: 'resolved' })
                  setInspecting(null)
                }}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Resolve issue
              </Button>
            ) : null}
          </>
        }
      >
        {inspecting ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone={SEVERITY_TONE[inspecting.severity] ?? 'neutral'}>
                <span className="capitalize">{inspecting.severity} severity</span>
              </Badge>
              <Badge tone={inspecting.status === 'open' ? 'warning' : 'success'}>
                <span className="capitalize">{inspecting.status}</span>
              </Badge>
              {inspecting.donation ? <StatusBadge status={inspecting.donation.status} /> : null}
            </div>
            <p className="rounded-xl bg-forest-50 p-4 text-sm leading-relaxed text-forest-700">
              {inspecting.description}
            </p>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl border border-forest-100 p-3">
                <dt className="text-[11px] font-medium text-forest-500">Reported by</dt>
                <dd className="mt-0.5 font-medium text-forest-800">
                  {inspecting.reporter?.name ?? 'Unknown'}
                  {inspecting.reporter?.role ? ` (${inspecting.reporter.role})` : ''}
                </dd>
              </div>
              <div className="rounded-xl border border-forest-100 p-3">
                <dt className="text-[11px] font-medium text-forest-500">Created</dt>
                <dd className="mt-0.5 font-medium text-forest-800">{formatDateTime(inspecting.created_at)}</dd>
              </div>
              {inspecting.donation ? (
                <div className="rounded-xl border border-forest-100 p-3 sm:col-span-2">
                  <dt className="text-[11px] font-medium text-forest-500">Related donation</dt>
                  <dd className="mt-0.5">
                    <Link
                      to={`/donations/${inspecting.donation.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {inspecting.donation.food_name}
                    </Link>
                  </dd>
                </div>
              ) : null}
              {inspecting.resolved_at ? (
                <div className="rounded-xl border border-forest-100 p-3 sm:col-span-2">
                  <dt className="text-[11px] font-medium text-forest-500">Resolved</dt>
                  <dd className="mt-0.5 font-medium text-forest-800">{formatDateTime(inspecting.resolved_at)}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(resolving)}
        onClose={() => setResolving(null)}
        onConfirm={() => resolve(resolving.status)}
        loading={busy}
        title={resolving?.status === 'resolved' ? 'Mark as resolved?' : 'Reopen this issue?'}
        confirmLabel={resolving?.status === 'resolved' ? 'Resolve' : 'Reopen'}
        message={
          resolving?.status === 'resolved'
            ? 'The issue will be closed and shown as resolved in the log.'
            : 'The issue will return to the open queue for further review.'
        }
      />
    </DashboardLayout>
  )
}
