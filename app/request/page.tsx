'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createMatchRequest } from '@/lib/actions/match-actions'
import { Header } from '@/components/header'
import { TileCard } from '@/components/onboarding/tile-card'

type Region = 'NORTH_BAY' | 'SAN_FRANCISCO' | 'EAST_BAY' | 'SOUTH_BAY'
type TimeWindow = 'THIS_WEEK' | 'NEXT_WEEK' | 'FLEXIBLE'
type PartyType = 'SOLO' | 'COUPLE'
type MatchPreference = 'SOLO_ONLY' | 'COUPLE_ONLY' | 'OPEN'

export default function RequestDinnerPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [region, setRegion] = useState<Region | ''>('')
  const [timeWindow, setTimeWindow] = useState<TimeWindow | ''>('')
  const [partyType, setPartyType] = useState<PartyType | ''>('')
  const [matchPreference, setMatchPreference] = useState<MatchPreference | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is verified (has phone in session)
    const verifiedPhone = sessionStorage.getItem('signup_phone') || sessionStorage.getItem('verified_phone')

    if (!verifiedPhone) {
      // Not verified, redirect to join
      router.push('/join')
      return
    }

    setPhone(verifiedPhone)

    // Pre-fill region from member profile if exists
    // For now, we'll let them select
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!region || !timeWindow || !partyType || !matchPreference) {
      setError('Please complete all fields')
      setIsLoading(false)
      return
    }

    const result = await createMatchRequest({
      phone,
      region,
      timeWindow,
      partyType,
      matchPreference,
    })

    setIsLoading(false)

    if (result.success) {
      router.push('/request/success')
    } else {
      setError(result.error)
    }
  }

  if (!phone) {
    return null // Will redirect
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Request a Dinner
            </h1>
            <p className="text-base text-gray-600">
              We&apos;ll match you with someone nearby and text you to confirm.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Region */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Where do you want to meet? *
              </label>
              <div className="space-y-3">
                <TileCard
                  label="North Bay"
                  selected={region === 'NORTH_BAY'}
                  onClick={() => setRegion('NORTH_BAY')}
                />
                <TileCard
                  label="San Francisco"
                  selected={region === 'SAN_FRANCISCO'}
                  onClick={() => setRegion('SAN_FRANCISCO')}
                />
                <TileCard
                  label="East Bay"
                  selected={region === 'EAST_BAY'}
                  onClick={() => setRegion('EAST_BAY')}
                />
                <TileCard
                  label="South Bay"
                  selected={region === 'SOUTH_BAY'}
                  onClick={() => setRegion('SOUTH_BAY')}
                />
              </div>
            </div>

            {/* Time Window */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                When? *
              </label>
              <div className="space-y-3">
                <TileCard
                  label="This week"
                  selected={timeWindow === 'THIS_WEEK'}
                  onClick={() => setTimeWindow('THIS_WEEK')}
                />
                <TileCard
                  label="Next week"
                  selected={timeWindow === 'NEXT_WEEK'}
                  onClick={() => setTimeWindow('NEXT_WEEK')}
                />
                <TileCard
                  label="Flexible"
                  selected={timeWindow === 'FLEXIBLE'}
                  onClick={() => setTimeWindow('FLEXIBLE')}
                />
              </div>
            </div>

            {/* Party Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Who&apos;s coming? *
              </label>
              <div className="space-y-3">
                <TileCard
                  label="Just me"
                  selected={partyType === 'SOLO'}
                  onClick={() => setPartyType('SOLO')}
                />
                <TileCard
                  label="Me + partner"
                  selected={partyType === 'COUPLE'}
                  onClick={() => setPartyType('COUPLE')}
                />
              </div>
            </div>

            {/* Match Preference */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Match me with... *
              </label>
              <div className="space-y-3">
                <TileCard
                  label="Another solo diner"
                  selected={matchPreference === 'SOLO_ONLY'}
                  onClick={() => setMatchPreference('SOLO_ONLY')}
                />
                <TileCard
                  label="Another couple"
                  selected={matchPreference === 'COUPLE_ONLY'}
                  onClick={() => setMatchPreference('COUPLE_ONLY')}
                />
                <TileCard
                  label="Open to either"
                  selected={matchPreference === 'OPEN'}
                  onClick={() => setMatchPreference('OPEN')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Request Dinner'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
