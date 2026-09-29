import { AlertTriangle, CheckCircle2, Clock, PackageCheck, ShieldCheck, Thermometer, Truck, XCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { SectionHeading } from '../components/Card'
import { foodSafetyTips } from '../data/mockAnalytics'

const TEMPERATURES = [
  { label: 'Hot holding', value: 'Above 60°C', icon: Thermometer, tone: 'bg-danger-50 text-danger-500' },
  { label: 'Cold holding', value: 'Below 5°C', icon: Thermometer, tone: 'bg-info-50 text-info-500' },
  { label: 'Maximum journey', value: '2 hours', icon: Clock, tone: 'bg-amber-soft-50 text-amber-soft-600' },
]

const NEVER = [
  'Food that has been served to customers or is part of a customer buffet',
  'Food that is spoiled, mouldy, burnt, smelly or has been left out overnight',
  'Food past its consume-before time',
  'Food that has already been handled by a customer (for example, returned plates)',
  'Anything that could be mistaken for commercially packaged goods without labelling',
  'Alcohol, tobacco or any other non-food items',
]

const CHECKLIST = [
  { label: 'Prepared today and safely stored', done: true },
  { label: 'Preparation and consume-before times filled in', done: true },
  { label: 'Allergens and diet clearly declared', done: true },
  { label: 'Sealed, food-grade packaging used', done: true },
  { label: 'Pickup window is realistic', done: true },
  { label: 'Pickup point and contact person shared', done: true },
]

export default function FoodSafety() {
  return (
    <div>
      <PageHeader
        eyebrow="Food safety"
        title="Safe food, safe hands, safe community"
        description="FoodBridge helps coordinate donations. Donors and recipients remain responsible for judging whether food is safe — these guidelines make that shared responsibility clear."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Food Safety' }]}
        action={
          <Button to="/register?role=hotel" variant="outline">
            Post a donation safely
          </Button>
        }
      />

      {/* critical rules */}
      <section className="py-12">
        <div className="container-page space-y-10">
          <div className="grid gap-4 sm:grid-cols-3">
            {TEMPERATURES.map((item, index) => {
              const Icon = item.icon
              return (
                <Reveal key={item.label} delay={index * 0.08}>
                  <div className="card flex items-center gap-4 p-6">
                    <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.tone}`}>
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-forest-500">{item.label}</p>
                      <p className="text-xl font-bold text-forest-900">{item.value}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>

          <Reveal>
            <div className="flex items-start gap-4 rounded-2xl border border-danger-500/25 bg-danger-50 p-6">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-danger-500 shadow-soft">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-danger-700">When in doubt, do not donate</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-danger-700/90">
                  A wasted listing is always safer than an unsafe meal. If you are unsure whether food is
                  suitable, discard it through your normal waste route and do not post it on FoodBridge.
                </p>
              </div>
            </div>
          </Reveal>

          {/* guidelines */}
          <section>
            <SectionHeading
              eyebrow="Guidelines"
              title="Six rules every partner follows"
              description="These apply to hotels posting donations and to NGOs and volunteers collecting them."
            />
            <ol className="mt-12 grid gap-5 lg:grid-cols-2">
              {foodSafetyTips.map((tip, index) => (
                <Reveal key={tip.title} as="li" delay={index * 0.06}>
                  <div className="card h-full p-6">
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-50 text-success-500">
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">
                          Guideline {index + 1}
                        </p>
                        <h3 className="mt-1 text-base font-semibold">{tip.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-forest-600">{tip.body}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </section>

          {/* never donate */}
          <section className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="card h-full p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-danger-50 text-danger-500">
                    <XCircle className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="text-lg font-semibold">Never donate</h2>
                </div>
                <ul className="mt-5 space-y-3">
                  {NEVER.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-forest-600">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="card h-full p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <PackageCheck className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="text-lg font-semibold">Before you publish</h2>
                </div>
                <ul className="mt-5 space-y-3">
                  {CHECKLIST.map((item) => (
                    <li key={item.label} className="flex items-start gap-2.5 text-sm text-forest-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-500" aria-hidden="true" />
                      {item.label}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge tone="success" icon={ShieldCheck}>
                    Verified partners only
                  </Badge>
                  <Badge tone="info" icon={Truck}>
                    Timed pickups tracked
                  </Badge>
                </div>
                <Button to="/donations" variant="subtle" className="mt-5 w-full">
                  Browse available donations
                </Button>
              </div>
            </Reveal>
          </section>

          {/* roles */}
          <section className="rounded-3xl border border-forest-100 bg-white p-8 shadow-soft sm:p-10">
            <SectionHeading
              eyebrow="Responsibilities"
              title="Who is responsible for what"
              align="center"
              className="mx-auto max-w-2xl"
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {[
                {
                  role: 'Hotels & restaurants',
                  points: [
                    'Only offer food that is safe and fit for human consumption',
                    'Fill in preparation and consume-before times accurately',
                    'Declare allergens, diet type and packaging availability',
                    'Keep the food at the correct temperature until pickup',
                  ],
                },
                {
                  role: 'Volunteers',
                  points: [
                    'Arrive within the stated pickup window',
                    'Use clean, sealed food-grade containers',
                    'Maintain the cold or hot chain during transport',
                    'Report any safety concern instead of distributing',
                  ],
                },
                {
                  role: 'NGOs',
                  points: [
                    'Check the labelling before accepting a donation',
                    'Distribute quickly and safely after collection',
                    'Record the number of beneficiaries served',
                    'Escalate incidents through the in-app report flow',
                  ],
                },
              ].map((group, index) => (
                <Reveal key={group.role} delay={index * 0.08}>
                  <div className="h-full rounded-2xl border border-forest-100 bg-canvas p-6">
                    <h3 className="text-base font-semibold text-brand-700">{group.role}</h3>
                    <ul className="mt-4 space-y-2.5">
                      {group.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5 text-sm text-forest-600">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                            aria-hidden="true"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
