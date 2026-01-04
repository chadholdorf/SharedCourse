'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { checkMemberStatus } from '@/lib/actions/member-actions'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = await checkMemberStatus(phone)

    setIsLoading(false)

    if (result.success) {
      if (result.data.exists) {
        // TODO: Implement OTP or session creation
        // For now, just redirect to request page
        router.push('/request')
      } else {
        setError("Phone number not found. Please sign up first.")
      }
    } else {
      setError(result.error)
    }
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 uppercase tracking-tight">
                Welcome Back
              </h1>
              <p className="text-base text-gray-600">
                Sign in to your Bay Area Supper Club account
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="(555) 555-5555"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 text-base font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Checking...' : 'Continue'}
              </button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link href="/membership" className="text-gray-900 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
