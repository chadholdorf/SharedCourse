'use server'

import { prisma } from '@/lib/prisma'
import { createEventSchema, type CreateEventInput } from '@/lib/validations'
import { EventStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

type ActionResponse<T = void> = {
  success: boolean
  data?: T
  error?: string
}

export async function createEvent(input: CreateEventInput): Promise<ActionResponse<{ id: string }>> {
  try {
    // Validate input
    const validated = createEventSchema.parse(input)

    // Create event
    const event = await prisma.event.create({
      data: {
        title: validated.title,
        city: validated.city,
        startAt: new Date(validated.startAt),
        rsvpCloseAt: new Date(validated.rsvpCloseAt),
        groupSize: validated.groupSize,
        status: EventStatus.open, // New events start as 'open'
      },
    })

    // Revalidate events list
    revalidatePath('/events')
    revalidatePath('/admin/events')

    return { success: true, data: { id: event.id } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Failed to create event:', error)
    return { success: false, error: 'Failed to create event' }
  }
}

export async function getOpenEvents(): Promise<Array<{
  id: string
  title: string
  city: string
  startAt: Date
  rsvpCloseAt: Date
  groupSize: number
  rsvpCount: number
  spotsLeft: number
}>> {
  const now = new Date()

  const events = await prisma.event.findMany({
    where: {
      status: EventStatus.open,
      rsvpCloseAt: { gt: now }, // RSVP deadline hasn't passed
    },
    orderBy: { startAt: 'asc' },
    select: {
      id: true,
      title: true,
      city: true,
      startAt: true,
      rsvpCloseAt: true,
      groupSize: true,
      rsvps: {
        select: {
          partySize: true,
        },
      },
    },
  })

  // Calculate spots left for each event
  return events.map(event => {
    const totalGuests = event.rsvps.reduce((sum, rsvp) => sum + rsvp.partySize, 0)
    const spotsLeft = event.groupSize - totalGuests
    return {
      id: event.id,
      title: event.title,
      city: event.city,
      startAt: event.startAt,
      rsvpCloseAt: event.rsvpCloseAt,
      groupSize: event.groupSize,
      rsvpCount: event.rsvps.length,
      spotsLeft: Math.max(0, spotsLeft),
    }
  })
}

export async function getEventById(id: string): Promise<{
  id: string
  title: string
  city: string
  startAt: Date
  rsvpCloseAt: Date
  status: EventStatus
  groupSize: number
} | null> {
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      city: true,
      startAt: true,
      rsvpCloseAt: true,
      status: true,
      groupSize: true,
    },
  })

  return event
}

export async function getEventForJoin(id: string): Promise<{
  id: string
  title: string
  city: string
  startAt: Date
  rsvpCloseAt: Date
  groupSize: number
  spotsLeft: number
  isOpen: boolean
} | null> {
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      city: true,
      startAt: true,
      rsvpCloseAt: true,
      groupSize: true,
      status: true,
      rsvps: {
        select: {
          partySize: true,
        },
      },
    },
  })

  if (!event) {
    return null
  }

  const totalGuests = event.rsvps.reduce((sum, rsvp) => sum + rsvp.partySize, 0)
  const spotsLeft = Math.max(0, event.groupSize - totalGuests)
  const now = new Date()
  const isOpen = event.status === EventStatus.open && event.rsvpCloseAt > now && spotsLeft > 0

  return {
    id: event.id,
    title: event.title,
    city: event.city,
    startAt: event.startAt,
    rsvpCloseAt: event.rsvpCloseAt,
    groupSize: event.groupSize,
    spotsLeft,
    isOpen,
  }
}
