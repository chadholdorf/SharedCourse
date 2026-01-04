import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface EventCardProps {
  event: {
    id: string
    title: string
    city: string
    startAt: Date
    rsvpCloseAt: Date
    groupSize: number
    _count?: { rsvps: number }
  }
}

export function EventCard({ event }: EventCardProps) {
  const spotsLeft = event.groupSize - (event._count?.rsvps || 0)

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
      <p className="text-gray-600 mb-4">{event.city}</p>

      <div className="space-y-2 mb-4 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Event Date:</span>{' '}
          {formatDate(event.startAt)}
        </p>
        <p>
          <span className="font-semibold">RSVP Deadline:</span>{' '}
          {formatDate(event.rsvpCloseAt)}
        </p>
        <p>
          <span className="font-semibold">Spots Available:</span>{' '}
          {spotsLeft} of {event.groupSize}
        </p>
      </div>

      <Link
        href={`/join/${event.id}`}
        className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
      >
        Join Event
      </Link>
    </div>
  )
}
