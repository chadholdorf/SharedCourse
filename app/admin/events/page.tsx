'use client'

import { useState } from 'react'
import { createEvent } from '@/lib/actions/event-actions'
import { SubmitButton } from '@/components/submit-button'
import type { CreateEventInput } from '@/lib/validations'

export default function AdminEventsPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)

    const input: CreateEventInput = {
      title: formData.get('title') as string,
      city: formData.get('city') as string,
      startAt: formData.get('startAt') as string,
      rsvpCloseAt: formData.get('rsvpCloseAt') as string,
      groupSize: Number(formData.get('groupSize')),
    }

    const result = await createEvent(input)

    if (result.success) {
      setSuccess(`Event created successfully! ID: ${result.data?.id}`)
      ;(e.target as HTMLFormElement).reset()
    } else {
      setError(result.error || 'Failed to create event')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600 mb-6">Admin Panel</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Event Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                placeholder="Sunday Supper in Mission District"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                placeholder="San Francisco"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="startAt" className="block text-sm font-semibold text-gray-700 mb-2">
                Event Start Date & Time
              </label>
              <input
                type="datetime-local"
                id="startAt"
                name="startAt"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="rsvpCloseAt" className="block text-sm font-semibold text-gray-700 mb-2">
                RSVP Deadline
              </label>
              <input
                type="datetime-local"
                id="rsvpCloseAt"
                name="rsvpCloseAt"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="groupSize" className="block text-sm font-semibold text-gray-700 mb-2">
                Group Size
              </label>
              <input
                type="number"
                id="groupSize"
                name="groupSize"
                defaultValue={6}
                min={2}
                max={20}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <SubmitButton>Create Event</SubmitButton>
          </form>
        </div>
      </div>
    </main>
  )
}
