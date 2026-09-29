import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  HeartHandshake,
  Leaf,
  MapPin,
  PackageCheck,
  Recycle,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Truck,
  UserRound,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import Button from '../components/Button'
import Reveal from '../components/Reveal'
import Badge from '../components/Badge'
import DonationCard from '../components/DonationCard'
import FoodCategory from '../components/FoodCategory'
import { EmptyState } from '../components/Card'
import { DonationCardSkeleton } from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'
import { useAsync } from '../hooks/useAsync'
import { useCountUp } from '../hooks/useCountUp'
import { getDonations } from '../services/donations'
import { impactSummary } from '../data/mockDonations'
import { APP } from '../utils/constants'

const STEPS = [
  {
    icon: Building2,
    title: 'Hotels share',
    body: 'Restaurants and hotels post their safe surplus food with quantity, timing and pickup details.',
    tone: 'from-brand-500 to-brand-700',
  },
  {
    icon: HeartHandshake,
    title: 'NGOs & volunteers respond',
    body: 'Nearby organisations and volunteers are notified and accept the donation in a single tap.',
    tone: 'from-amber-soft-400 to-amber-soft-600',
  },
  {
    icon: Truck,
    title: 'Food is collected',
    body: 'A volunteer collects the food within the pickup window with proper handling and packaging.',
    tone: 'from-info-500 to-brand-600',
  },
  {
    icon: Users,
    title: 'Food reaches people',
    body: 'NGOs distribute the meals to shelters, families and anyone who needs a warm meal today.',
    tone: 'from-brand-700 to-forest-900',
  },
]

const STATS = [
  { key: 'meals_saved', label: 'Meals Saved', suffix: '+', icon: PackageCheck, tone: 'brand' },
  { key: 'food_donors', label: 'Food Donors', suffix: '+', icon: Building2, tone: 'amber' },
  { key: 'ngos', label: 'NGOs', suffix: '+', icon: HeartHandshake, tone: 'info' },
  { key: 'people_served', label: 'People Served', suffix: '+', icon: Users, tone: 'brand' },
  { key: 'waste_reduced_kg', label: 'Food Waste Reduced', suffix: ' kg', icon: TrendingDown, tone: 'amber' },
]

const ROLES = [
  {
    icon: Building2,
    title: 'Hotels & Restaurants',
    body: 'Post surplus food in under a minute and see exactly who collected it and the impact you created.',
    to: '/register?role=hotel',
    cta: 'Start donating',
  },
  {
    icon: HeartHandshake,
    title: 'NGOs',
    body: 'Find safe food near you, request donations, assign volunteers and track every meal served.',
    to: '/register?role=ngo',
    cta: 'Join as an NGO',
  },
  {
    icon: UserRound,
    title: 'Volunteers',
    body: 'Pick up nearby food, follow a simple pickup route and confirm delivery from your phone.',
    to: '/register?role=volunteer',
    cta: 'Volunteer with us',
  },
]

function Counter({ value, suffix }) {
  const { ref, value: current } = useCountUp(value)
  return (
    <span ref={ref} className="tabular-nums">
      {current.toLocaleString('en-IN')}
      {suffix}
    </span>
  )
}

export default function Home() {
  const { data, loading, error, reload } = useAsync(
    () => getDonations({ availability: 'posted', sort: 'deadline' }),
    [],
  )
  const featured = (data?.donations ?? []).slice(0, 6)

  return (
    <div>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="pointer-events-none absolute inset-0 grain opacity-60"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-amber-soft-100/70 blur-3xl"
          aria-hidden="true"
        />

        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
                <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                {APP.tagline}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-6 text-4xl leading-[1.08] font-bold text-forest-900 sm:text-5xl lg:text-6xl"
            >
              Turn Surplus Food Into{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-brand-600">Social Impact.</span>
                <motion.span
                  className="absolute inset-x-0 bottom-1.5 -z-0 h-3 rounded-full bg-amber-soft-200"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: 0.6, ease: 'easeOut' }}
                  style={{ originX: 0 }}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-forest-600 sm:text-lg"
            >
              Connect local hotels and restaurants with NGOs and volunteers to make sure safe surplus food
              reaches people who need it — while nothing edible goes to waste.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button to="/register?role=hotel" size="lg">
                Donate Food
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button to="/donations" size="lg" variant="outline">
                Find Food
              </Button>
              <Button to="/#how-it-works" size="lg" variant="ghost">
                How It Works
              </Button>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.36 }}
              className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-forest-100 pt-6"
            >
              {[
                { label: 'Verified partners', value: '430+' },
                { label: 'Cities active', value: '12' },
                { label: 'Avg. pickup time', value: '48 min' },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-medium text-forest-500">{item.label}</dt>
                  <dd className="mt-1 text-xl font-bold text-forest-900">{item.value}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          <HeroIllustration />
        </div>
      </section>

      {/* --------------------------------------------------------- impact */}
      <section className="border-y border-forest-100 bg-forest-950 py-16 text-white sm:py-20">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-brand-300">Our impact so far</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Every number here was a meal that could have been wasted
            </h2>
            <p className="mt-4 text-forest-200">
              Live impact across partner hotels, NGOs and volunteers in our network.
            </p>
          </Reveal>

          <dl className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5">
            {STATS.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur"
                >
                  <span className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <dd className="text-2xl font-bold text-white sm:text-3xl">
                    <Counter value={impactSummary[stat.key]} suffix={stat.suffix} />
                  </dd>
                  <dt className="mt-1.5 text-sm text-forest-200">{stat.label}</dt>
                </motion.div>
              )
            })}
          </dl>

          <Reveal delay={0.2} className="mt-10 flex justify-center">
            <Button to="/impact" variant="white" size="lg">
              See the full impact report
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------- how it works */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Four simple steps to a complete donation</h2>
            <p className="mt-4 text-forest-600">
              From surplus food on a hotel kitchen counter to a warm meal in a family's hands — with a
              clear record at every step.
            </p>
          </Reveal>

          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.li
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                  className="group relative"
                >
                  <div className="card card-hover h-full p-6">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${step.tone} text-white shadow-soft`}
                      >
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <span className="text-3xl font-bold text-forest-100">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-forest-600">{step.body}</p>
                  </div>
                  {index < STEPS.length - 1 ? (
                    <ArrowRight
                      className="absolute top-1/2 -right-4 hidden h-6 w-6 -translate-y-1/2 text-forest-200 lg:block"
                      aria-hidden="true"
                    />
                  ) : null}
                </motion.li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------- live donations */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-page">
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Available now</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Surplus food posted near Kozhikode</h2>
              <p className="mt-3 max-w-xl text-forest-600">
                NGOs and volunteers can browse, request and collect these donations in real time.
              </p>
            </div>
            <Button to="/donations" variant="outline">
              Browse all donations
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Reveal>

          <div className="mt-8">
            <FoodCategory active="all" onChange={() => {}} />
          </div>

          {loading ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <DonationCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorState className="mt-8" message={error} onRetry={reload} />
          ) : featured.length === 0 ? (
            <EmptyState
              className="mt-8"
              icon={UtensilsCrossed}
              title="No donations available right now"
              description="New surplus food is posted throughout the day. Check back soon or set an alert as an NGO."
              action={<Button to="/register?role=hotel">Post surplus food</Button>}
            />
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((donation, index) => (
                <DonationCard key={donation.id} donation={donation} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- roles */}
      <section className="py-16 sm:py-24">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Who can join</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">One community, three ways to help</h2>
            <p className="mt-4 text-forest-600">
              Whether you run a kitchen, run a shelter or simply have an evening to spare — there is a role
              for you.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {ROLES.map((role, index) => {
              const Icon = role.icon
              return (
                <Reveal key={role.title} delay={index * 0.1}>
                  <div className="card card-hover flex h-full flex-col p-7">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold">{role.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-forest-600">{role.body}</p>
                    <Button to={role.to} variant="subtle" className="mt-5 self-start">
                      {role.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- safety */}
      <section className="bg-forest-900 py-16 text-white sm:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-brand-300">Food safety first</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Safety guidelines every partner follows
            </h2>
            <p className="mt-4 max-w-lg text-forest-200">
              FoodBridge helps coordinate donations. Donors and recipients are responsible for judging
              whether food is safe to donate and to handle it correctly. Our guidelines make that shared
              responsibility clear.
            </p>
            <Button to="/food-safety" variant="white" className="mt-6">
              Read the guidelines
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Reveal>

          <Reveal delay={0.15} variant="right">
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, text: 'Only safe, suitable food is donated' },
                { icon: PackageCheck, text: 'Correct hot and cold storage guidance' },
                { icon: BadgeCheck, text: 'Clear allergen and diet labelling' },
                { icon: Recycle, text: 'No spoiled or expired food, ever' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <li
                    key={item.text}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" aria-hidden="true" />
                    <span className="text-sm text-forest-100">{item.text}</span>
                  </li>
                )
              })}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- cta */}
      <section className="py-16 sm:py-24">
        <div className="container-page">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-forest-900 px-6 py-14 text-center text-white sm:px-14">
              <div className="pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
              <Sparkles className="mx-auto h-8 w-8 text-amber-soft-300" aria-hidden="true" />
              <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
                Ready to turn today's surplus into tomorrow's meal?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-brand-50">
                Join hotels, NGOs and volunteers already reducing food waste in your city. It takes less
                than two minutes to register.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button to="/register" size="lg" variant="white">
                  Create your account
                </Button>
                <Button
                  to="/map"
                  size="lg"
                  className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Explore the food map
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <Badge tone="brand" className="bg-white/15 text-white ring-white/20">
                  Free to join
                </Badge>
                <Badge tone="brand" className="bg-white/15 text-white ring-white/20">
                  Verified partners
                </Badge>
                <Badge tone="brand" className="bg-white/15 text-white ring-white/20">
                  Transparent impact tracking
                </Badge>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function HeroIllustration() {
  const nodes = [
    { icon: Building2, label: 'Hotel', tone: 'bg-brand-600' },
    { icon: UtensilsCrossed, label: 'Surplus food', tone: 'bg-amber-soft-500' },
    { icon: Truck, label: 'Volunteer pickup', tone: 'bg-info-500' },
    { icon: Users, label: 'Community', tone: 'bg-forest-800' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative mx-auto w-full max-w-lg lg:max-w-none"
    >
      <div className="relative rounded-3xl border border-forest-100 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">Live donation flow</p>
            <p className="mt-1 text-lg font-semibold">Green Leaf Restaurant → Snehapooram Trust</p>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Leaf className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        <ol className="mt-8 space-y-4">
          {nodes.map((node, index) => {
            const Icon = node.icon
            return (
              <motion.li
                key={node.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.4 + index * 0.15 }}
                className="flex items-center gap-4"
              >
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.4, ease: 'easeInOut' }}
                  className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${node.tone} text-white shadow-soft`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </motion.span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-forest-900">{node.label}</p>
                  <p className="truncate text-xs text-forest-500">
                    {
                      [
                        'Posts 40 meals of vegetable biriyani',
                        'Collected within 30 minutes of posting',
                        'Picked up by a verified volunteer',
                        'Served to 40 people at the community kitchen',
                      ][index]
                    }
                  </p>
                </div>
                <Badge tone="success" className="shrink-0">
                  {['Posted', 'Confirmed', 'Collected', 'Distributed'][index]}
                </Badge>
              </motion.li>
            )
          })}
        </ol>

        <div className="mt-7 grid grid-cols-3 gap-3 border-t border-forest-100 pt-5 text-center">
          {[
            { label: 'Meals rescued', value: '40' },
            { label: 'Waste avoided', value: '14 kg' },
            { label: 'CO₂ saved (est.)', value: '35 kg' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-base font-bold text-brand-700">{item.value}</p>
              <p className="text-[11px] text-forest-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-4 -bottom-6 hidden rounded-2xl border border-forest-100 bg-white p-4 shadow-lift sm:block"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-500">
            <PackageCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">Donation completed</p>
            <p className="text-xs text-forest-500">40 meals delivered · just now</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
