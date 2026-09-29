import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  HandHeart,
  HeartHandshake,
  Leaf,
  MapPin,
  Recycle,
  ShieldCheck,
  Sparkles,
  Target,
  Truck,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import Button from '../components/Button'
import Badge from '../components/Badge'
import StatCard from '../components/StatCard'
import { SectionHeading } from '../components/Card'
import { impactSummary } from '../data/mockDonations'
import { APP } from '../utils/constants'

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Safety before speed',
    body: 'Every partner is verified, every listing carries preparation and consume-before times, and unsafe food never gets published.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified partners only',
    body: 'Hotels, NGOs and volunteers are reviewed by our admin team before they can post, request or collect.',
  },
  {
    icon: Recycle,
    title: 'Nothing edible wasted',
    body: 'Clear labelling, correct storage and quick pickups mean surplus food arrives in the condition it was prepared.',
  },
  {
    icon: Users,
    title: 'Community first',
    body: 'We work with local kitchens, shelters and volunteers — the people who already know their neighbourhood best.',
  },
]

const TIMELINE = [
  {
    year: '2024',
    title: 'The idea',
    body: 'A group of restaurant owners and social workers in Kozhikode noticed 40+ kg of safe surplus food thrown away every single evening.',
  },
  {
    year: '2025',
    title: 'First pilot',
    body: 'FoodBridge launched with three partner kitchens and two community kitchens, coordinating 400 meals in the first month.',
  },
  {
    year: '2025',
    title: 'Volunteer network',
    body: 'Volunteer pickups were introduced so NGOs could claim donations without their own transport.',
  },
  {
    year: '2026',
    title: 'Open platform',
    body: 'The public map, impact dashboard and role-based workspaces launched across 12 cities.',
  },
]

const TEAM = [
  { name: 'Arun Menon', role: 'Platform & Safety', icon: ShieldCheck, bio: 'Oversees verification, food safety policy and dispute resolution.' },
  { name: 'Lakshmi Narayanan', role: 'NGO Partnerships', icon: HeartHandshake, bio: 'Works with community kitchens and shelters across Kozhikode.' },
  { name: 'Rahul Varma', role: 'Hotel Network', icon: UtensilsCrossed, bio: 'Helps restaurants standardise how they list and pack surplus.' },
  { name: 'Nikhil Raj', role: 'Volunteer Lead', icon: HandHeart, bio: 'Coordinates pickup routes and trains new volunteers.' },
]

export default function About() {
  return (
    <div>
      <PageHeader
        eyebrow="About us"
        title="Bridging the gap between surplus food and people who need it"
        description="FoodBridge is a community platform where verified hotels, NGOs and volunteers move safe surplus food quickly, transparently and responsibly."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
        action={
          <Button to="/register">
            Join the network
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        }
      />

      {/* ------------------------------------------------------------ story */}
      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="eyebrow">Our story</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">It started with a full kitchen and an empty stomach</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-forest-600">
              <p>
                In Kozhikode, restaurant kitchens were throwing away perfectly good biriyani, chapati and
                curry because nobody could collect it in time. At the same time, community kitchens and
                shelters were short of food. The problem was never a shortage — it was timing, trust and
                coordination.
              </p>
              <p>
                FoodBridge exists to close that gap. A hotel posts what it has, with honest preparation
                times and pickup windows. Verified NGOs and volunteers nearby get notified, claim it, and
                collect it safely. Every step is recorded, so impact can be measured honestly.
              </p>
              <p>
                We are a technology platform, not a food charity — which means we can help many local
                organisations work together without any of them losing their independence.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <Badge tone="success" icon={BadgeCheck}>
                Free for every partner
              </Badge>
              <Badge tone="brand" icon={Leaf}>
                Open data on impact
              </Badge>
              <Badge tone="info" icon={MapPin}>
                {impactSummary.cities} cities
              </Badge>
            </div>
          </Reveal>

          <Reveal variant="left" delay={0.1}>
            <div className="rounded-3xl border border-forest-100 bg-white p-7 shadow-card">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Target className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">What we are trying to change</h3>
              <ul className="mt-4 space-y-4">
                {[
                  { title: 'Food thrown away while people go hungry', body: 'Surplus is time-sensitive; coordination is the missing link.' },
                  { title: 'Unsafe food shared in good faith', body: 'Clear rules and honest labelling protect everyone.' },
                  { title: 'Impact claims nobody can verify', body: 'Every donation has a tracked status and a recorded outcome.' },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-forest-900">{item.title}</p>
                      <p className="mt-0.5 text-sm text-forest-600">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- numbers */}
      <section className="border-y border-forest-100 bg-white py-14">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Where we are today</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">A community that keeps growing</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Meals saved', value: impactSummary.meals_saved.toLocaleString('en-IN'), unit: '+', icon: Sparkles, tone: 'brand' },
              { label: 'Partner hotels', value: impactSummary.partner_hotels, unit: '', icon: Building2, tone: 'amber' },
              { label: 'NGOs', value: impactSummary.ngos, unit: '', icon: HeartHandshake, tone: 'info' },
              { label: 'Volunteers', value: impactSummary.volunteers, unit: '', icon: HandHeart, tone: 'success' },
            ].map((stat, index) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                unit={stat.unit}
                icon={stat.icon}
                tone={stat.tone}
                index={index}
                hint="Updated from live platform data"
              />
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- pillars */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we stand for"
            title="Four principles behind every donation"
            description="These rules decide whether a listing can be published, who can collect it and what happens when something goes wrong."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {PILLARS.map((pillar, index) => {
              const Icon = pillar.icon
              return (
                <Reveal key={pillar.title} delay={index * 0.08}>
                  <div className="card card-hover flex h-full gap-4 p-6">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">{pillar.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-forest-600">{pillar.body}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- timeline */}
      <section className="bg-forest-950 py-16 text-white sm:py-20">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-brand-300">Our journey</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">How FoodBridge grew</h2>
          </Reveal>

          <ol className="mt-14 space-y-8">
            {TIMELINE.map((item, index) => (
              <motion.li
                key={item.year}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="grid gap-3 sm:grid-cols-[8rem_1fr] sm:gap-8"
              >
                <div className="flex items-center gap-3 sm:block">
                  <span className="inline-flex h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-bold text-white">
                    {item.year}
                  </span>
                </div>
                <div className="border-l-2 border-brand-600/40 pl-5">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-forest-200">{item.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ team */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="The people"
            title="Small team, wide network"
            description="A core team looks after verification, safety and the platform — supported by hundreds of local volunteers."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((person, index) => {
              const Icon = person.icon
              return (
                <Reveal key={person.name} delay={index * 0.08}>
                  <div className="card h-full p-6 text-center">
                    <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold">{person.name}</h3>
                    <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">{person.role}</p>
                    <p className="mt-3 text-sm leading-relaxed text-forest-600">{person.bio}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- cta */}
      <section className="pb-20">
        <div className="container-page">
          <Reveal>
            <div className="flex flex-col items-start gap-6 rounded-3xl border border-brand-200 bg-brand-50/60 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div>
                <h2 className="text-2xl font-semibold sm:text-3xl">Come be part of the change</h2>
                <p className="mt-2 max-w-xl text-forest-600">
                  Whether you run a kitchen, run a shelter or have two free hours a week — {APP.name} is
                  free, open and built for Kerala's communities.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Button to="/register" size="lg">
                  Create an account
                </Button>
                <Button to="/map" size="lg" variant="outline">
                  <Truck className="h-4 w-4" aria-hidden="true" />
                  See the map
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
