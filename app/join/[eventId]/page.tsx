'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { RsvpFormStep1 } from '@/components/rsvp-form-step1'
import { RsvpFormStep2 } from '@/components/rsvp-form-step2'
import { createRsvp } from '@/lib/actions/rsvp-actions'
import type { RsvpStepAInput, RsvpStepBInput } from '@/lib/validations'

export default function JoinEventPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const eventId = params.eventId as string
  const currentStep = Number(searchParams.get('step') || '1')

  const [stepAData, setStepAData] = useState<RsvpStepAInput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStepANext = (data: RsvpStepAInput) => {
    setStepAData(data)
    router.push(`/join/${eventId}?step=2`)
  }

  const handleStepBBack = () => {
    router.push(`/join/${eventId}?step=1`)
  }

  const handleStepBSubmit = async (stepBData: RsvpStepBInput) => {
    if (!stepAData) {
      setError('Please complete Step 1 first')
      router.push(`/join/${eventId}?step=1`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await createRsvp({
      eventId,
      ...stepAData,
      ...stepBData,
    })

    if (result.success) {
      router.push(`/join/${eventId}/success`)
    } else {
      setError(result.error || 'Failed to submit RSVP')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Event</h1>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`flex-1 h-2 rounded ${currentStep >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          </div>

          <p className="text-gray-600 mb-6">
            Step {currentStep} of 2: {currentStep === 1 ? 'Preferences' : 'Contact Information'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {currentStep === 1 && (
            <RsvpFormStep1 onNext={handleStepANext} initialData={stepAData || undefined} />
          )}

          {currentStep === 2 && (
            <RsvpFormStep2
              onBack={handleStepBBack}
              onSubmit={handleStepBSubmit}
            />
          )}
        </div>
      </div>
    </main>
  )
}
