import { Ban, HandCoins, Scale, ShieldAlert, Truck, UserCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import { APP } from '../utils/constants'

export const TERMS_SECTIONS = [
  {
    id: 'membership',
    title: 'Membership and eligibility',
    icon: UserCheck,
    body: [
      'You must be 18 or older to create an account on FoodBridge.',
      'Hotels, restaurants and NGOs must provide valid registration details. Verification is required before posting or requesting donations.',
      'One person or organisation may maintain multiple accounts, but each account is a single responsible party.',
      'Accounts may be suspended if information provided is found to be false or misleading.',
    ],
  },
  {
    id: 'donations',
    title: 'Posting and claiming donations',
    icon: Truck,
    body: [
      'Donors may only post food that is safe, fit for human consumption and accurately described.',
      'Preparation time, consume-before time, allergens and diet type must be completed truthfully.',
      'A claim is confirmed when a verified NGO or volunteer requests the donation; only one party may hold a donation at a time.',
      'Donors may edit or withdraw a donation only while it has not been claimed.',
    ],
  },
  {
    id: 'collection',
    title: 'Collection and distribution',
    icon: HandCoins,
    body: [
      'Volunteers must arrive within the published pickup window and use clean, food-grade containers.',
      'Hot or cold food must be kept above 60°C or below 5°C during transport.',
      'NGOs are responsible for safe storage, distribution and accurate recording of beneficiaries served.',
      'Neither party may resell, redistribute commercially or store donated food for future use beyond safe limits.',
    ],
  },
  {
    id: 'conduct',
    title: 'Community conduct',
    icon: Scale,
    body: [
      'Treat every partner respectfully. Harassment, discrimination or abuse of any kind is not permitted.',
      'Do not post misleading listings, fake requests or any content unrelated to food donation.',
      'Do not attempt to access accounts, dashboards or data belonging to other members.',
      'Report concerns through the in-app reporting flow; we investigate every report.',
    ],
  },
  {
    id: 'suspension',
    title: 'Suspension and reporting',
    icon: Ban,
    body: [
      'We may suspend or remove an account that repeatedly violates these terms or puts food safety at risk.',
      'Verified partners involved in a confirmed safety breach may be permanently removed from the network.',
      'Reports are reviewed by the admin team, and the outcome is recorded for transparency.',
    ],
  },
]

export default function Terms() {
  return (
    <div>
      <PageHeader
        eyebrow="Legal"
        title="Terms of use"
        description={`The rules that keep ${APP.name} safe, fair and useful for every member of the community.`}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Terms' }]}
      />

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[16rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Terms sections" className="card p-4">
            <p className="px-2 pb-2 text-xs font-bold tracking-wide text-forest-400 uppercase">On this page</p>
            <ul className="space-y-1">
              {TERMS_SECTIONS.map((section) => (
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
          <div className="mt-4 rounded-2xl border border-danger-500/20 bg-danger-50 p-4">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-danger-700">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              FoodBridge coordinates donations only. It is not a food business and cannot guarantee the
              safety of any third-party food.
            </p>
          </div>
        </aside>

        <div className="space-y-8">
          <div className="card p-6 sm:p-7">
            <h2 className="text-xl font-semibold">Acceptance of these terms</h2>
            <p className="mt-3 text-sm leading-relaxed text-forest-600">
              By creating an account or using {APP.name} you agree to these terms, to our{' '}
              <a href="/privacy" className="font-semibold text-brand-700 underline">
                privacy policy
              </a>{' '}
              and to our{' '}
              <a href="/food-safety" className="font-semibold text-brand-700 underline">
                food safety guidelines
              </a>
              . If you do not agree, please do not use the platform.
            </p>
            <p className="mt-3 text-xs text-forest-500">
              Last updated: 1 March 2026. This is a demonstration document written for a sample application.
            </p>
          </div>

          {TERMS_SECTIONS.map((section) => {
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

          <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-forest-600">
              Ready to join? It is free and takes about two minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button to="/register">Create an account</Button>
              <Button to="/contact" variant="outline">
                Ask a question
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
