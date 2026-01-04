import Link from 'next/link'

export default function DonePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
            Welcome to
            <br />
            Bay Area
            <br />
            Supper Club
          </h1>
          <p className="text-lg text-gray-600">
            We&apos;ll text you when a dinner match is ready.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/request"
            className="block w-full px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Request a Dinner →
          </Link>

          <Link
            href="/"
            className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
