import Link from 'next/link'
import { Header } from '@/components/header'

export default function Home() {
  return (
    <>
      <Header />

      {/* Announcement Banner */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 text-center">
            <p className="text-sm text-gray-600">
              Gift memberships now available →
            </p>
          </div>
        </div>
      </div>

      <main className="bg-white">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
              BAY AREA
              <br />
              SUPPER CLUB
            </h1>
            <p className="text-base sm:text-lg text-gray-500 tracking-wide">
              North Bay • San Francisco • East Bay • South Bay
            </p>
          </div>
        </section>

        {/* Body Copy */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32">
          <div className="space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed">
            <p>
              Bay Area Supper Club is a membership-based supper club for people who want an easy way to meet others over dinner.
            </p>

            <p>
              Pick when you are free, choose your vibe, and we will match you with a small group nearby. Join solo or bring your spouse or partner. Couples always stay together.
            </p>

            <p>
              When a match is ready, we text you to confirm. No inbox. No back and forth. Just dinner.
            </p>

            <p className="text-sm text-gray-500 pt-4">
              Now forming groups each week.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                Become a member
              </h2>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/membership"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 transition-colors min-w-[200px]"
                >
                  Become a Member
                </Link>

                <Link
                  href="/request"
                  className="text-base text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Request a dinner
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-sm text-gray-500">
              © 2026 Bay Area Supper Club
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}
