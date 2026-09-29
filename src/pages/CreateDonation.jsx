import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, Lightbulb, Package, ShieldCheck } from 'lucide-react'
import DashboardLayout from '../components/Sidebar'
import Button from '../components/Button'
import DonationForm from '../components/DonationForm'
import { Card, SectionHeading } from '../components/Card'
import { ConfirmDialog } from '../components/Modal'
import { useToast } from '../context/ToastContext'
import { createDonation } from '../services/donations'
import { hotelNav } from '../utils/dashNav'
import { foodSafetyTips } from '../data/mockAnalytics'

const TIPS = [
  'Post as soon as you know the surplus — NGOs near you are notified right away.',
  'Be specific about the pickup window; volunteers plan their route around it.',
  'Only list food that has been prepared and stored safely (see food safety guidelines).',
  'Include the number of meals so partners can plan the right distribution.',
]

export default function CreateDonation() {
  const navigate = useNavigate()
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [pending, setPending] = useState(null)

  const handleSubmit = (values) => {
    setPending(values)
    setPublishOpen(true)
  }

  const confirmPublish = async () => {
    setSubmitting(true)
    try {
      const result = await createDonation(pending)
      const donation = result?.donation
      toast.success(`Your ${donation?.meals ?? 0} meals of ${donation?.food_name ?? 'food'} are now visible to NGOs nearby.`, {
        title: 'Donation published',
      })
      setPublishOpen(false)
      navigate('/hotel/donations')
    } catch (error) {
      toast.error(error?.message ?? 'We could not publish your donation.')
      setPublishOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      title="Create donation"
      subtitle="Post surplus food for NGOs and volunteers nearby"
      nav={hotelNav}
      actions={
        <Button to="/hotel/donations" size="sm" variant="outline">
          My donations
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="p-5 sm:p-7">
          <DonationForm
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Review & publish"
            onCancel={() => navigate('/hotel/donations')}
          />
        </Card>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-amber-soft-500" aria-hidden="true" />
              Tips for a successful post
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm text-forest-600">
              {TIPS.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                  {tip}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Food safety essentials
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-forest-600">
              {foodSafetyTips.slice(0, 4).map((tip) => (
                <li key={tip.title ?? tip} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
                  {tip.title ? <span><span className="font-medium text-forest-800">{tip.title}: </span>{tip.body ?? tip.description}</span> : tip}
                </li>
              ))}
            </ul>
            <Button to="/food-safety" variant="subtle" size="sm" className="mt-4 w-full">
              Read the full guidelines
            </Button>
          </Card>

          <Card className="p-5">
            <SectionHeading
              align="left"
              eyebrow="Good to know"
              title="What happens next"
              description="Once published, verified NGOs in range are notified and can request your donation."
            />
            <ol className="mt-3 space-y-2.5 text-sm text-forest-600">
              {[
                'An NGO requests your donation.',
                'You assign a volunteer to collect it.',
                'The volunteer collects and delivers the food.',
                'You confirm completion and see your impact grow.',
              ].map((step, index) => (
                <li key={step} className="flex gap-2.5">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-4 flex items-start gap-2 text-xs text-forest-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                <Package className="mr-1 inline h-3 w-3" aria-hidden="true" />
                Food you post is only visible to verified partner organisations.
              </span>
            </p>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onConfirm={confirmPublish}
        loading={submitting}
        title="Publish this donation?"
        confirmLabel="Publish now"
        message={`${pending?.meals ?? 0} meals of ${pending?.food_name ?? ''} will be visible to verified NGOs in range and notified immediately.`}
      />
    </DashboardLayout>
  )
}
