import Link from 'next/link'
import { Header } from '@/components/header'

export default function RequestSuccessPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              You&apos;re in
            </h1>
            <p className="text-lg text-gray-600">
              We&apos;ll text you when we find a match.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/request"
              className="block w-full px-6 py-3 text-base font-medium text-gray-900 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Request another dinner
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
    </>
  )
}
