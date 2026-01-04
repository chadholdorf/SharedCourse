import Link from 'next/link'

export default function DonePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-10">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            You&apos;re in.
          </h1>

          <p className="text-lg text-gray-800 mb-4 leading-relaxed">
            We&apos;ll text you when a dinner match is ready.
            <br />
            No emails. No apps to check.
            <br />
            Just a text when it&apos;s time.
          </p>

          <p className="text-sm text-gray-500">
            You&apos;ll only hear from us when there&apos;s a real match.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to home
          </Link>

          <Link
            href="/request"
            className="block text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            Or request a dinner now
          </Link>
        </div>
      </div>
    </main>
  )
}
