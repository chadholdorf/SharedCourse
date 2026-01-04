'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDinnerRequest } from '@/lib/actions/dinner-request-actions'
import { formatPhoneE164 } from '@/lib/sms'
import { SubmitButton } from '@/components/submit-button'

export default function RequestDinnerPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isCouple, setIsCouple] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    // Format phone numbers to E.164
    const phone = formatPhoneE164(formData.get('phone') as string)
    const partnerPhone = formData.get('partnerPhone') as string
    const formattedPartnerPhone = partnerPhone ? formatPhoneE164(partnerPhone) : ''

    const result = await createDinnerRequest({
      city: formData.get('city') as string,
      name: formData.get('name') as string,
      phone,
      email: formData.get('email') as string || '',
      isCouple: formData.get('isCouple') === 'true',
      partnerName: formData.get('partnerName') as string || '',
      partnerPhone: formattedPartnerPhone,
      budget: formData.get('budget') as 'ONE' | 'TWO',
      diet: formData.get('diet') as 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'glutenFree' | 'dairyFree',
      allergies: formData.get('allergies') as string || '',
      vibe: (formData.get('vibe') as 'relaxed' | 'conversational' | 'mix' | '') || null,
    })

    if (result.success) {
      router.push('/request/success')
    } else {
      setError(result.error || 'Failed to submit request')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request a Shared Dinner</h1>
          <p className="text-gray-600 mb-6">
            Tell us your preferences and we&apos;ll text you when we find a match.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                placeholder="San Francisco"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                placeholder="415-555-1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">We&apos;ll text you updates. No spam.</p>
            </div>

            {/* Email (optional) */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="john@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Solo or Couple */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Request Type *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isCouple"
                    value="false"
                    checked={!isCouple}
                    onChange={() => setIsCouple(false)}
                    className="mr-2"
                  />
                  <span>Just me</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isCouple"
                    value="true"
                    checked={isCouple}
                    onChange={() => setIsCouple(true)}
                    className="mr-2"
                  />
                  <span>Me + Partner (couple)</span>
                </label>
              </div>
            </div>

            {/* Partner fields (if couple) */}
            {isCouple && (
              <>
                <div>
                  <label htmlFor="partnerName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Partner&apos;s Name *
                  </label>
                  <input
                    type="text"
                    id="partnerName"
                    name="partnerName"
                    required={isCouple}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="partnerPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Partner&apos;s Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="partnerPhone"
                    name="partnerPhone"
                    placeholder="415-555-5678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
                Budget Preference *
              </label>
              <select
                id="budget"
                name="budget"
                required
                defaultValue=""
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="" disabled>Select budget...</option>
                <option value="ONE">$ (Budget-friendly)</option>
                <option value="TWO">$$ (Moderate)</option>
              </select>
            </div>

            {/* Diet */}
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

            {/* Allergies */}
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

            {/* Vibe */}
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

            <SubmitButton>Submit Request</SubmitButton>
          </form>
        </div>
      </div>
    </main>
  )
}
