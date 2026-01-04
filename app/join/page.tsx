'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAccount } from '@/lib/actions/auth-actions'

export default function JoinPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = await createAccount({
      fullName,
      phone,
      agreedToTerms,
    })

    setIsLoading(false)

    if (result.success) {
      // Store phone in sessionStorage for verify page
      sessionStorage.setItem('signup_phone', result.data.phone)
      sessionStorage.setItem('signup_name', fullName)
      router.push('/join/verify')
    } else {
      setError(result.error)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 uppercase tracking-tight">
            Join Bay Area
            <br />
            Supper Club
          </h1>
          <p className="text-base text-gray-600">
            Create your account to get started
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="415-555-1234"
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
              disabled={isLoading}
              className="mt-1 w-4 h-4 border-gray-300 rounded text-gray-900 focus:ring-gray-900"
            />
            <label htmlFor="terms" className="text-sm text-gray-800">
              I agree to the{' '}
              <a href="/terms" className="text-gray-900 underline hover:text-gray-700">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-gray-900 underline hover:text-gray-700">
                Privacy Policy
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Continue'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/login" className="text-gray-900 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
