import { Header } from '@/components/header'

export default function NewsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            News
          </h1>
          <p className="text-lg text-gray-600">
            More coming soon.
          </p>
        </div>
      </main>
    </>
  )
}
