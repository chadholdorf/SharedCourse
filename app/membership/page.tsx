'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { joinWaitlist } from '@/lib/actions/member-actions'

export default function MembershipPage() {
  const [submitted, setSubmitted] = useState(false)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = await joinWaitlist({ phone })

    setIsLoading(false)

    if (result.success) {
      setSubmitted(true)
    } else {
      setError(result.error)
    }
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {!submitted ? (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Join the Club
                </h1>
                <p className="text-lg text-gray-600">
                  Memberships launching soon. Leave your number and we&apos;ll text you when we&apos;re ready.
                </p>
              </div>

              {error && (
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    We&apos;ll text you when memberships open.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 text-base font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Joining...' : 'Join Waitlist'}
                </button>
              </form>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Already have access?{' '}
                  <Link href="/request" className="text-gray-900 hover:underline">
                    Request a dinner
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  You&apos;re on the list
                </h2>
                <p className="text-lg text-gray-600">
                  We&apos;ll text you at {phone} when memberships open.
                </p>
              </div>

              <div className="pt-8">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
