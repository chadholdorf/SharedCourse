import Link from 'next/link'
import { getEventById } from '@/lib/actions/event-actions'
import { formatDate } from '@/lib/utils'

export default async function RsvpSuccessPage({
  params,
}: {
  params: { eventId: string }
}) {
  const event = await getEventById(params.eventId)

  if (!event) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            RSVP Confirmed!
          </h1>
          <p className="text-2xl text-white/90 mb-8 drop-shadow">
            We&apos;ll email you the details soon.
          </p>
          <Link
            href="/events"
            className="px-8 py-3 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Browse More Events
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <svg className="w-24 h-24 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          You&apos;re In!
        </h1>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 text-white border border-white/20">
          <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
          <p className="text-xl mb-1">{event.city}</p>
          <p className="text-lg opacity-90">{formatDate(event.startAt)}</p>
        </div>

        <p className="text-xl text-white/90 mb-8 drop-shadow">
          We&apos;ll email you the details soon.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/events"
            className="px-8 py-3 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Browse More Events
          </Link>
          <Link
            href="/"
            className="px-8 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border-2 border-white"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
