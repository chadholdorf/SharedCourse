'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getEventForJoin } from '@/lib/actions/event-actions'
import { createRsvp } from '@/lib/actions/rsvp-actions'
import { SubmitButton } from '@/components/submit-button'
import { formatDate } from '@/lib/utils'

export default function JoinEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<Awaited<ReturnType<typeof getEventForJoin>>>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadEvent() {
      const eventData = await getEventForJoin(eventId)
      setEvent(eventData)
      setLoading(false)
    }
    loadEvent()
  }, [eventId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    const result = await createRsvp({
      eventId,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      partySize: Number(formData.get('partySize')),
      diet: formData.get('diet') as string,
      allergies: formData.get('allergies') as string || '',
      vibe: (formData.get('vibe') as string) || null,
    })

    if (result.success) {
      router.push(`/join/${eventId}/success`)
    } else {
      setError(result.error || 'Failed to submit RSVP')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-gray-600">Loading event...</div>
      </main>
    )
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600">This event doesn't exist or has been removed.</p>
        </div>
      </main>
    )
  }

  if (!event.isOpen) {
    const reason = event.spotsLeft === 0
      ? 'This event is full.'
      : new Date() > event.rsvpCloseAt
        ? 'The RSVP deadline has passed.'
        : 'This event is no longer accepting RSVPs.'

    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <p className="text-gray-600 mb-6">{event.city}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-semibold">{reason}</p>
            </div>
            <button
              onClick={() => router.push('/events')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View Other Events
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join {event.title}</h1>
          <p className="text-gray-600 mb-1">{event.city}</p>
          <p className="text-sm text-gray-500 mb-6">
            {formatDate(event.startAt)} • {event.spotsLeft} spots left
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="partySize" className="block text-sm font-semibold text-gray-700 mb-2">
                Party Size *
              </label>
              <select
                id="partySize"
                name="partySize"
                required
                defaultValue="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="1">Just me (1)</option>
                <option value="2">Me + 1 (2)</option>
              </select>
            </div>

            <div>
              <label htmlFor="diet" className="block text-sm font-semibold text-gray-700 mb-2">
                Dietary Preference *
              </label>
              <select
                id="diet"
                name="diet"
                required
                defaultValue="none"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="none">No restrictions</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="glutenFree">Gluten-Free</option>
                <option value="dairyFree">Dairy-Free</option>
              </select>
            </div>

            <div>
              <label htmlFor="allergies" className="block text-sm font-semibold text-gray-700 mb-2">
                Allergies or Additional Restrictions
              </label>
              <textarea
                id="allergies"
                name="allergies"
                rows={3}
                placeholder="e.g., peanuts, shellfish..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="vibe" className="block text-sm font-semibold text-gray-700 mb-2">
                Dinner Vibe Preference
              </label>
              <select
                id="vibe"
                name="vibe"
                defaultValue=""
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">No preference</option>
                <option value="relaxed">Relaxed</option>
                <option value="conversational">Conversational</option>
                <option value="mix">Mix of both</option>
              </select>
            </div>

            <SubmitButton>Reserve My Spot</SubmitButton>
          </form>
        </div>
      </div>
    </main>
  )
}
