import { Database, Lock, Mail, ShieldCheck, Trash2, UserCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { APP } from '../utils/constants'

export const PRIVACY_SECTIONS = [
  {
    id: 'collect',
    title: 'Information we collect',
    icon: Database,
    body: [
      'Account details: your name, email address, phone number, city and area so that pickups can be coordinated.',
      'Organisation details: organisation name, type and registration number. These are reviewed by our admin team for verification.',
      'Donation details: food description, quantity, preparation and pickup times, pickup address and any special instructions you provide.',
      'Usage data: pages visited and actions taken inside the app, so we can improve the experience and keep the platform secure.',
    ],
  },
  {
    id: 'use',
    title: 'How we use your information',
    icon: UserCheck,
    body: [
      'To match surplus food with verified NGOs and volunteers who can collect it safely and on time.',
      'To send you notifications about donations, requests, pickups and tasks relevant to your role.',
      'To verify organisations, resolve reports and keep the community trustworthy.',
      'To publish anonymised, aggregated impact figures — never personal information.',
    ],
  },
  {
    id: 'sharing',
    title: 'Who we share it with',
    icon: ShieldCheck,
    body: [
      'Your contact name, organisation and pickup address are shared with the NGO or volunteer who has claimed a donation involving you.',
      'We do not sell personal information and we do not share it for advertising.',
      'We may disclose information where required by law or to protect the safety of the community.',
    ],
  },
  {
    id: 'security',
    title: 'How we protect it',
    icon: Lock,
    body: [
      'Passwords are never stored in plain text. In this demo build, credentials are only compared locally in your browser.',
      'Verification documents submitted at registration are visible only to the admin team and are never published.',
      'Your session token is kept in your browser storage so you stay signed in; signing out clears it.',
    ],
  },
  {
    id: 'rights',
    title: 'Your rights',
    icon: Trash2,
    body: [
      'You can update your name, contact details, area and organisation details at any time from your profile page.',
      'You can change your password from the settings page.',
      'You can ask us to delete your account, which removes your personal data from the platform.',
      'You can leave the network at any time — there is no lock-in and no fee.',
    ],
  },
]

export default function Privacy() {
  return (
    <div>
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description={`How ${APP.name} collects, uses and protects your personal information.`}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Privacy' }]}
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[16rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Privacy policy sections" className="card p-4">
            <p className="px-2 pb-2 text-xs font-bold tracking-wide text-forest-400 uppercase">On this page</p>
            <ul className="space-y-1">
              {PRIVACY_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-lg px-2.5 py-1.5 text-sm text-forest-600 transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-4 px-2 text-xs text-forest-500">
            Last updated: 1 March 2026. This is a demonstration policy written for a sample application.
          </p>
        </aside>

        <div className="space-y-8">
          <div className="rounded-2xl border border-info-500/20 bg-info-50 p-5 text-sm leading-relaxed text-info-700">
            <p className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Questions about your data? Write to{' '}
                <a href={`mailto:${APP.email}`} className="font-semibold underline">
                  {APP.email}
                </a>{' '}
                and we will respond within one working day.
              </span>
            </p>
          </div>

          {PRIVACY_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <section key={section.id} id={section.id} className="card scroll-mt-24 p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                <ul className="mt-5 space-y-3">
                  {section.body.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-forest-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}

          <section className="card p-6 sm:p-7">
            <h2 className="text-xl font-semibold">Demo data notice</h2>
            <p className="mt-3 text-sm leading-relaxed text-forest-600">
              This project runs entirely in your browser using local storage. All organisations, people,
              phone numbers and addresses shown in the app are fictional demonstration data. Clearing your
              browser storage removes everything stored by the app, including your account and session.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
