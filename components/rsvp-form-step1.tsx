'use client'

import { RsvpStepAInput } from '@/lib/validations'
import { SubmitButton } from './submit-button'

interface RsvpFormStep1Props {
  onNext: (data: RsvpStepAInput) => void
  initialData?: Partial<RsvpStepAInput>
}

export function RsvpFormStep1({ onNext, initialData }: RsvpFormStep1Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data: RsvpStepAInput = {
      partySize: Number(formData.get('partySize')),
      budget: formData.get('budget') as 'ONE' | 'TWO',
      diet: formData.get('diet') as 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'glutenFree' | 'dairyFree',
      allergies: formData.get('allergies') as string || '',
      vibe: (formData.get('vibe') as 'relaxed' | 'conversational' | 'mix' | '') || null,
      afterDinner: (formData.get('afterDinner') as 'home' | 'open' | '') || null,
    }

    onNext(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="partySize" className="block text-sm font-semibold text-gray-700 mb-2">
          Party Size
        </label>
        <select
          id="partySize"
          name="partySize"
          required
          defaultValue={initialData?.partySize || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Select...</option>
          <option value="1">Just me (1)</option>
          <option value="2">Me + 1 (2)</option>
        </select>
      </div>

      <div>
        <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
          Budget Preference
        </label>
        <select
          id="budget"
          name="budget"
          required
          defaultValue={initialData?.budget || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Select...</option>
          <option value="ONE">$ (Budget-friendly)</option>
          <option value="TWO">$$ (Moderate)</option>
        </select>
      </div>

      <div>
        <label htmlFor="diet" className="block text-sm font-semibold text-gray-700 mb-2">
          Dietary Restriction
        </label>
        <select
          id="diet"
          name="diet"
          required
          defaultValue={initialData?.diet || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Select...</option>
          <option value="none">None</option>
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
          defaultValue={initialData?.allergies || ''}
          placeholder="e.g., peanuts, shellfish..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="vibe" className="block text-sm font-semibold text-gray-700 mb-2">
          Dinner Vibe Preference (Optional)
        </label>
        <select
          id="vibe"
          name="vibe"
          defaultValue={initialData?.vibe || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">No preference</option>
          <option value="relaxed">Relaxed</option>
          <option value="conversational">Conversational</option>
          <option value="mix">Mix of both</option>
        </select>
      </div>

      <div>
        <label htmlFor="afterDinner" className="block text-sm font-semibold text-gray-700 mb-2">
          After Dinner Plans (Optional)
        </label>
        <select
          id="afterDinner"
          name="afterDinner"
          defaultValue={initialData?.afterDinner || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">No preference</option>
          <option value="home">Head home</option>
          <option value="open">Open to more</option>
        </select>
      </div>

      <SubmitButton>Continue to Contact Info</SubmitButton>
    </form>
  )
}
