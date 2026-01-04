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

    // Use transaction to prevent race conditions
    const rsvp = await prisma.$transaction(async (tx) => {
      // Check event exists and is open
      const event = await tx.event.findUnique({
        where: { id: validated.eventId },
        select: {
          id: true,
          status: true,
          rsvpCloseAt: true,
          groupSize: true,
          rsvps: {
            select: {
              partySize: true,
            },
          },
        },
      })

      if (!event) {
        throw new Error('Event not found')
      }

      if (event.status !== EventStatus.open) {
        throw new Error('Event is not open for RSVPs')
      }

      if (new Date() > event.rsvpCloseAt) {
        throw new Error('RSVP deadline has passed')
      }

      // Calculate current capacity based on sum of partySize
      const totalGuests = event.rsvps.reduce((sum, rsvp) => sum + rsvp.partySize, 0)
      const spotsLeft = event.groupSize - totalGuests

      // Check if enough capacity for this party
      if (spotsLeft < validated.partySize) {
        throw new Error(`Not enough spots available. Only ${spotsLeft} spots left.`)
      }

      // Create RSVP (unique constraint will prevent duplicates)
      return await tx.rsvp.create({
        data: {
          eventId: validated.eventId,
          name: validated.name,
          email: validated.email,
          phone: '', // Not collected in Sprint 1
          partySize: validated.partySize,
          budget: 'ONE', // Default value, not collected in Sprint 1
          diet: validated.diet,
          allergies: validated.allergies || '',
          vibe: validated.vibe || null,
          afterDinner: null, // Not collected in Sprint 1
        },
      })
    })

    // Revalidate events list
    revalidatePath('/events')
    revalidatePath(`/join/${validated.eventId}`)

    return { success: true, data: { id: rsvp.id } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }

    // Handle unique constraint violation (duplicate RSVP)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { success: false, error: 'You have already RSVPed to this event' }
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to create RSVP'
    console.error('Failed to create RSVP:', error)
    return { success: false, error: errorMessage }
  }
}
