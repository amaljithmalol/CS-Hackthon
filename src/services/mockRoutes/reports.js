import { ApiError } from '../api'
import { route } from '../mockRouter'
import { newId, updateDb } from '../db'
import { enrichDonation, notify, requireSession } from './helpers'

route('get', '/reports', ({ session, db }) => {
  const actor = requireSession(session)
  if (actor.role !== 'admin') {
    throw new ApiError('You do not have permission to view reports.', 403, 'forbidden')
  }
  const reports = db.reports
    .map((report) => {
      const donation = db.donations.find((d) => d.id === report.donation_id)
      const reporter = db.users.find((u) => u.id === report.reported_by)
      return {
        ...report,
        donation: donation ? { id: donation.id, food_name: donation.food_name, status: donation.status } : null,
        reporter: reporter ? { id: reporter.id, name: reporter.name, role: reporter.role } : null,
      }
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { reports }
})

route('post', '/reports', ({ body, session, db }) => {
  const user = requireSession(session)
  if (!body.subject?.trim()) throw new ApiError('Please add a short subject.', 422, 'validation')
  if (!body.description?.trim()) throw new ApiError('Please describe the issue.', 422, 'validation')

  const report = {
    id: newId('r'),
    donation_id: body.donation_id ?? null,
    reported_by: user.id,
    subject: body.subject.trim(),
    description: body.description.trim(),
    severity: body.severity ?? 'medium',
    status: 'open',
    created_at: new Date().toISOString(),
  }
  updateDb((database) => {
    database.reports.unshift(report)
  })
  notify({
    userIds: 'u-admin-1',
    type: 'report',
    title: 'New issue reported',
    message: report.subject,
    link: '/admin/dashboard',
  })
  void db
  return { report }
})

route('patch', '/reports/:id', ({ params, body, session, db }) => {
  const actor = requireSession(session)
  if (actor.role !== 'admin') {
    throw new ApiError('Only administrators can update reports.', 403, 'forbidden')
  }
  const report = db.reports.find((r) => r.id === params.id)
  if (!report) throw new ApiError('Report not found.', 404, 'not_found')
  updateDb((database) => {
    const target = database.reports.find((r) => r.id === params.id)
    if (body.status) target.status = body.status
    if (body.severity) target.severity = body.severity
    target.resolved_at = body.status === 'resolved' ? new Date().toISOString() : null
  })
  void enrichDonation
  return { report }
})
