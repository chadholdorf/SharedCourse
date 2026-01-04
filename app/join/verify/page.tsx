'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { verifyCode, sendVerificationCode } from '@/lib/actions/auth-actions'
import { BackButton } from '@/components/onboarding/back-button'

export default function VerifyPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(30)

  useEffect(() => {
    const storedPhone = sessionStorage.getItem('signup_phone')
    if (!storedPhone) {
      router.push('/join')
      return
    }
    setPhone(storedPhone)
  }, [router])

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendCountdown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    const result = await verifyCode({ phone, code })

    setIsLoading(false)

    if (result.success) {
      // Mark as verified in sessionStorage
      sessionStorage.setItem('phone_verified', 'true')
      router.push('/join/onboarding')
    } else {
      setError(result.error)
    }
  }

  const handleResend = async () => {
    if (!canResend) return

    setError(null)
    setSuccess(null)

    const result = await sendVerificationCode(phone)

    if (result.success) {
      setSuccess('New code sent!')
      setCanResend(false)
      setResendCountdown(30)
    } else {
      setError(result.error)
    }
  }

  const handleChangePhone = () => {
    sessionStorage.removeItem('signup_phone')
    sessionStorage.removeItem('signup_name')
    router.push('/join')
  }

  if (!phone) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <BackButton onClick={handleChangePhone} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Check your phone
          </h1>
          <p className="text-base text-gray-600 mb-2">
            Verification code sent to
          </p>
          <p className="text-base font-medium text-gray-900">{phone}</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-center text-2xl font-mono tracking-widest disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify & Create Account'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <button
            type="button"
            onClick={handleChangePhone}
            className="text-gray-600 hover:text-gray-900 hover:underline"
          >
            Change phone
          </button>
          <span className="text-gray-300">•</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className="text-gray-600 hover:text-gray-900 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
          >
            {canResend ? 'Resend code' : `Resend in ${resendCountdown}s`}
          </button>
        </div>
      </div>
    </main>
  )
}
