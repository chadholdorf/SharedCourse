'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateMemberProfile, completeOnboarding } from '@/lib/actions/member-actions'
import { TileCard } from '@/components/onboarding/tile-card'
import { ProgressIndicator } from '@/components/onboarding/progress-indicator'
import { BackButton } from '@/components/onboarding/back-button'

const TOTAL_STEPS = 4

export default function OnboardingPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Step 3: Home region
  const [homeRegion, setHomeRegion] = useState<'NORTH_BAY' | 'SAN_FRANCISCO' | 'EAST_BAY' | 'SOUTH_BAY' | ''>('')

  // Step 4: Travel radius
  const [travelRadius, setTravelRadius] = useState<'LOCAL' | 'SHORT_DRIVE' | 'LONG_DRIVE' | ''>('')

  // Step 5: Age range
  const [ageRange, setAgeRange] = useState<'UNDER_25' | 'AGE_25_34' | 'AGE_35_44' | 'AGE_45_54' | 'AGE_55_PLUS' | 'NO_ANSWER' | ''>('')

  // Step 6: Dinner frequency
  const [dinnerFrequency, setDinnerFrequency] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'RARELY' | 'NO_ANSWER' | ''>('')

  useEffect(() => {
    const storedPhone = sessionStorage.getItem('signup_phone')
    const verified = sessionStorage.getItem('phone_verified')

    if (!storedPhone || !verified) {
      router.push('/join')
      return
    }

    setPhone(storedPhone)
  }, [router])

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
      return
    }

    // Final step - save and complete
    setIsLoading(true)

    const profileData: {
      homeRegion?: 'NORTH_BAY' | 'SAN_FRANCISCO' | 'EAST_BAY' | 'SOUTH_BAY'
      travelRadius?: 'LOCAL' | 'SHORT_DRIVE' | 'LONG_DRIVE'
      ageRange?: 'UNDER_25' | 'AGE_25_34' | 'AGE_35_44' | 'AGE_45_54' | 'AGE_55_PLUS' | 'NO_ANSWER'
      dinnerFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'RARELY' | 'NO_ANSWER'
    } = {}

    if (homeRegion) profileData.homeRegion = homeRegion
    if (travelRadius) profileData.travelRadius = travelRadius
    if (ageRange) profileData.ageRange = ageRange
    if (dinnerFrequency) profileData.dinnerFrequency = dinnerFrequency

    await updateMemberProfile(phone, profileData)
    await completeOnboarding(phone)

    setIsLoading(false)

    // Clear session storage
    sessionStorage.removeItem('signup_phone')
    sessionStorage.removeItem('signup_name')
    sessionStorage.removeItem('phone_verified')

    router.push('/join/done')
  }

  const handleSkip = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      handleNext()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const canContinue = () => {
    if (step === 1) return homeRegion !== ''
    return true // Optional steps
  }

  if (!phone) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {step > 1 ? (
            <BackButton onClick={handleBack} />
          ) : (
            <div className="w-10" /> // Spacer
          )}
          <ProgressIndicator current={step} total={TOTAL_STEPS} />
        </div>

        {/* Step 3: Home Region */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 uppercase tracking-tight">
                Where are you in
                <br />
                the Bay Area?
              </h1>
              <p className="text-base text-gray-600">
                We match dinners nearby first.
              </p>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <TileCard
                label="North Bay"
                selected={homeRegion === 'NORTH_BAY'}
                onClick={() => setHomeRegion('NORTH_BAY')}
              />
              <TileCard
                label="San Francisco"
                selected={homeRegion === 'SAN_FRANCISCO'}
                onClick={() => setHomeRegion('SAN_FRANCISCO')}
              />
              <TileCard
                label="East Bay"
                selected={homeRegion === 'EAST_BAY'}
                onClick={() => setHomeRegion('EAST_BAY')}
              />
              <TileCard
                label="South Bay"
                selected={homeRegion === 'SOUTH_BAY'}
                onClick={() => setHomeRegion('SOUTH_BAY')}
              />
            </div>

            <div className="max-w-md mx-auto mt-8">
              <button
                onClick={handleNext}
                disabled={!canContinue()}
                className="w-full px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Travel Radius */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 uppercase tracking-tight">
                How far will you
                <br />
                travel for dinner?
              </h1>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <TileCard
                label="Staying local"
                selected={travelRadius === 'LOCAL'}
                onClick={() => setTravelRadius('LOCAL')}
              />
              <TileCard
                label="A short drive"
                selected={travelRadius === 'SHORT_DRIVE'}
                onClick={() => setTravelRadius('SHORT_DRIVE')}
              />
              <TileCard
                label="A longer drive"
                selected={travelRadius === 'LONG_DRIVE'}
                onClick={() => setTravelRadius('LONG_DRIVE')}
              />
            </div>

            <div className="max-w-md mx-auto mt-8 space-y-4">
              <button
                onClick={handleNext}
                className="w-full px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
              <button
                onClick={handleSkip}
                className="w-full text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Age Range */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 uppercase tracking-tight">
                What is your age?
                <br />
                (Optional)
              </h1>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <TileCard
                label="18-24"
                selected={ageRange === 'UNDER_25'}
                onClick={() => setAgeRange('UNDER_25')}
              />
              <TileCard
                label="25-34"
                selected={ageRange === 'AGE_25_34'}
                onClick={() => setAgeRange('AGE_25_34')}
              />
              <TileCard
                label="35-44"
                selected={ageRange === 'AGE_35_44'}
                onClick={() => setAgeRange('AGE_35_44')}
              />
              <TileCard
                label="45-54"
                selected={ageRange === 'AGE_45_54'}
                onClick={() => setAgeRange('AGE_45_54')}
              />
              <TileCard
                label="55+"
                selected={ageRange === 'AGE_55_PLUS'}
                onClick={() => setAgeRange('AGE_55_PLUS')}
              />
            </div>

            <div className="max-w-md mx-auto mt-8 space-y-4">
              <button
                onClick={handleNext}
                className="w-full px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
              <button
                onClick={handleSkip}
                className="w-full text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Dinner Frequency */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 uppercase tracking-tight">
                How often do you
                <br />
                want to do this?
              </h1>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <TileCard
                label="Weekly"
                selected={dinnerFrequency === 'WEEKLY'}
                onClick={() => setDinnerFrequency('WEEKLY')}
              />
              <TileCard
                label="Every other week"
                selected={dinnerFrequency === 'BIWEEKLY'}
                onClick={() => setDinnerFrequency('BIWEEKLY')}
              />
              <TileCard
                label="Monthly"
                selected={dinnerFrequency === 'MONTHLY'}
                onClick={() => setDinnerFrequency('MONTHLY')}
              />
              <TileCard
                label="Less than monthly"
                selected={dinnerFrequency === 'RARELY'}
                onClick={() => setDinnerFrequency('RARELY')}
              />
            </div>

            <div className="max-w-md mx-auto mt-8 space-y-4">
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="w-full px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Completing...' : 'Complete Setup'}
              </button>
              <button
                onClick={handleSkip}
                disabled={isLoading}
                className="w-full text-sm text-gray-600 hover:text-gray-900 hover:underline disabled:text-gray-400"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
