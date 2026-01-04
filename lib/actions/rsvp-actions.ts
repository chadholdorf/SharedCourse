'use server'

import { prisma } from '@/lib/prisma'
import { createRsvpSchema, type CreateRsvpInput } from '@/lib/validations'
import { EventStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

type ActionResponse<T = void> = {
  success: boolean
  data?: T
  error?: string
}

export async function createRsvp(input: CreateRsvpInput): Promise<ActionResponse<{ id: string }>> {
  try {
    // Validate input
    const validated = createRsvpSchema.parse(input)

    // Check event exists and is open
    const event = await prisma.event.findUnique({
      where: { id: validated.eventId },
      select: {
        id: true,
        status: true,
        rsvpCloseAt: true,
        groupSize: true,
        _count: { select: { rsvps: true } },
      },
    })

    if (!event) {
      return { success: false, error: 'Event not found' }
    }

    if (event.status !== EventStatus.open) {
      return { success: false, error: 'Event is not open for RSVPs' }
    }

    if (new Date() > event.rsvpCloseAt) {
      return { success: false, error: 'RSVP deadline has passed' }
    }

    // Check if event is full
    const totalRsvps = event._count.rsvps
    if (totalRsvps >= event.groupSize) {
      return { success: false, error: 'Event is full' }
    }

    // Check for duplicate email
    const existingRsvp = await prisma.rsvp.findFirst({
      where: {
        eventId: validated.eventId,
        email: validated.email,
      },
    })

    if (existingRsvp) {
      return { success: false, error: 'You have already RSVPed to this event' }
    }

    // Create RSVP
    const rsvp = await prisma.rsvp.create({
      data: {
        eventId: validated.eventId,
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        partySize: validated.partySize,
        budget: validated.budget,
        diet: validated.diet,
        allergies: validated.allergies || '',
        vibe: validated.vibe || null,
        afterDinner: validated.afterDinner || null,
      },
    })

    // Revalidate events list
    revalidatePath('/events')
    revalidatePath(`/join/${validated.eventId}`)

    return { success: true, data: { id: rsvp.id } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Failed to create RSVP:', error)
    return { success: false, error: 'Failed to create RSVP' }
  }
}
