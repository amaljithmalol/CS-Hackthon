import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { requestDonation } from '../services/donations'
import { formatDateTime, timeRemaining } from '../utils/formatDate'

/**
 * Shared "request this donation" flow used by the public listing, the NGO
 * dashboard and the volunteer screens. Keeps auth checks + toasts consistent.
 */
export function useDonationRequest({ onSuccess } = {}) {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [pending, setPending] = useState(null)
  const [loading, setLoading] = useState(false)

  const canRequest = user && (user.role === 'ngo' || user.role === 'volunteer')

  const openRequest = useCallback(
    (donation) => {
      if (!donation) return
      if (donation.status !== 'posted') {
        toast.error('This donation is no longer available.')
        return
      }
      if (!user) {
        toast.info('Please sign in as an NGO or volunteer to request this donation.')
        navigate('/login', { state: { from: `/donations/${donation.id}` } })
        return
      }
      if (!canRequest) {
        toast.warning('Only NGOs and volunteers can request a donation.')
        return
      }
      setPending(donation)
    },
    [user, canRequest, toast, navigate],
  )

  const confirmRequest = useCallback(async () => {
    if (!pending) return
    setLoading(true)
    try {
      await requestDonation(pending.id)
      toast.success(`Donation request sent for ${pending.food_name}.`, {
        title: 'Request sent',
      })
      setPending(null)
      onSuccess?.(pending)
    } catch (error) {
      toast.error(error?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [pending, toast, onSuccess])

  return {
    pending,
    loading,
    canRequest,
    openRequest,
    cancelRequest: () => setPending(null),
    confirmRequest,
  }
}

export function requestSummary(donation) {
  const deadline = timeRemaining(donation.pickup_end)
  return {
    meals: donation.meals,
    quantity: `${donation.quantity} ${donation.unit}`,
    pickup: formatDateTime(donation.pickup_start),
    deadline: deadline.label,
  }
}
