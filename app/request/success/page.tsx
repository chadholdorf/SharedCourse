import Link from 'next/link'

export default function RequestSuccessPage() {
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

        <p className="text-2xl text-white/90 mb-8 drop-shadow">
          We&apos;ll text you when we find a match.
        </p>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 text-white border border-white/20">
          <p className="text-lg mb-2">What happens next?</p>
          <ul className="text-left space-y-2 max-w-md mx-auto">
            <li className="flex items-start">
              <span className="mr-2">📱</span>
              <span>We&apos;ll match you with others in your city</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">💬</span>
              <span>You&apos;ll get a text when we find a group</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>Reply YES to confirm your spot</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/events"
            className="px-8 py-3 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            View Upcoming Dinners
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
