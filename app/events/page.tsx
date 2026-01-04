import { getOpenEvents } from '@/lib/actions/event-actions'
import { EventCard } from '@/components/event-card'

export const dynamic = 'force-dynamic' // Don't cache, always fresh data

export default async function EventsPage() {
  const events = await getOpenEvents()

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Open Events</h1>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No open events at the moment.</p>
            <p className="text-gray-500 mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
