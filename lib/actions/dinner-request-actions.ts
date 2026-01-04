'use server'

import { prisma } from '@/lib/prisma'
import { createDinnerRequestSchema, type CreateDinnerRequestInput } from '@/lib/validations'
import { DinnerRequestStatus, EventStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { sendRequestConfirmation, sendMatchNotification } from '@/lib/sms'

type ActionResponse<T = void> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a new dinner request
 * Validates, saves, triggers matching, and sends SMS confirmation
 */
export async function createDinnerRequest(
  input: CreateDinnerRequestInput
): Promise<ActionResponse<{ id: string; message: string }>> {
  try {
    // Validate input
    const validated = createDinnerRequestSchema.parse(input)

    // Check for existing OPEN request from this phone number
    const existingRequest = await prisma.dinnerRequest.findFirst({
      where: {
        phone: validated.phone,
        status: DinnerRequestStatus.OPEN,
      },
    })

    if (existingRequest) {
      return {
        success: false,
        error: 'You already have an open dinner request. We\'ll text you when we find a match!',
      }
    }

    // Create the dinner request
    const request = await prisma.dinnerRequest.create({
      data: {
        city: validated.city,
        name: validated.name,
        phone: validated.phone,
        email: validated.email || null,
        isCouple: validated.isCouple,
        partnerName: validated.partnerName || null,
        partnerPhone: validated.partnerPhone || null,
        budget: validated.budget,
        diet: validated.diet,
        allergies: validated.allergies || '',
        vibe: validated.vibe || null,
      },
    })

    // Send SMS confirmation
    await sendRequestConfirmation(validated.phone, validated.city)

    // Try to match requests in this city
    await tryMatchRequests(validated.city)

    // Revalidate admin pages
    revalidatePath('/admin/requests')

    return {
      success: true,
      data: {
        id: request.id,
        message: 'We\'ll text you when we find a match.',
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Failed to create dinner request:', error)
    return { success: false, error: 'Failed to create dinner request' }
  }
}

/**
 * Try to match open dinner requests in a city
 * Creates ProposedDinner and Event when quorum is reached
 */
export async function tryMatchRequests(city: string): Promise<void> {
  try {
    // Get all OPEN requests in this city
    const openRequests = await prisma.dinnerRequest.findMany({
      where: {
        city,
        status: DinnerRequestStatus.OPEN,
      },
      orderBy: {
        createdAt: 'asc', // First come, first served
      },
    })

    if (openRequests.length < 3) {
      // Need at least 3 people for a dinner
      console.log(`Not enough requests in ${city} (${openRequests.length}/3 minimum)`)
      return
    }

    // Simple matching: try to fill groups of 6
    const TARGET_GROUP_SIZE = 6
    let currentGroup: typeof openRequests = []
    let currentGroupSize = 0

    for (const request of openRequests) {
      const requestSize = request.isCouple ? 2 : 1

      // Check if adding this request would exceed group size
      if (currentGroupSize + requestSize > TARGET_GROUP_SIZE) {
        // Try to create a match with current group if we have at least 3 people
        const peopleCount = currentGroup.reduce((sum, r) => sum + (r.isCouple ? 2 : 1), 0)
        if (peopleCount >= 3) {
          await createProposedDinner(city, currentGroup)
        }
        // Start new group with this request
        currentGroup = [request]
        currentGroupSize = requestSize
      } else {
        currentGroup.push(request)
        currentGroupSize += requestSize
      }
    }

    // Handle remaining group
    const peopleCount = currentGroup.reduce((sum, r) => sum + (r.isCouple ? 2 : 1), 0)
    if (peopleCount >= 3) {
      await createProposedDinner(city, currentGroup)
    }
  } catch (error) {
    console.error('Failed to match requests:', error)
  }
}

/**
 * Create a ProposedDinner and Event from matched requests
 */
async function createProposedDinner(
  city: string,
  requests: Array<{
    id: string
    phone: string
    partnerPhone: string | null
    isCouple: boolean
    name: string
  }>
): Promise<void> {
  try {
    // Calculate total party size
    const totalPartySize = requests.reduce((sum, r) => sum + (r.isCouple ? 2 : 1), 0)

    // Create Event first
    const scheduledAt = new Date()
    scheduledAt.setDate(scheduledAt.getDate() + 7) // Next week
    scheduledAt.setHours(19, 0, 0, 0) // 7 PM

    const rsvpCloseAt = new Date(scheduledAt)
    rsvpCloseAt.setDate(rsvpCloseAt.getDate() - 1) // Day before

    const event = await prisma.event.create({
      data: {
        title: `Shared Dinner in ${city}`,
        city,
        startAt: scheduledAt,
        rsvpCloseAt,
        groupSize: totalPartySize,
        status: EventStatus.open,
      },
    })

    // Create ProposedDinner
    const proposedDinner = await prisma.proposedDinner.create({
      data: {
        eventId: event.id,
        city,
        scheduledAt,
      },
    })

    // Create ProposedDinnerMembers and mark requests as MATCHED
    for (const request of requests) {
      await prisma.proposedDinnerMember.create({
        data: {
          proposedDinnerId: proposedDinner.id,
          dinnerRequestId: request.id,
          phone: request.phone,
          partnerPhone: request.partnerPhone,
          partySize: request.isCouple ? 2 : 1,
        },
      })

      await prisma.dinnerRequest.update({
        where: { id: request.id },
        data: { status: DinnerRequestStatus.MATCHED },
      })

      // Send match notification
      const day = scheduledAt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      const time = scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      await sendMatchNotification(request.phone, day, time)
    }

    console.log(`✅ Created ProposedDinner ${proposedDinner.id} with ${requests.length} requests (${totalPartySize} people)`)

    // Revalidate
    revalidatePath('/events')
    revalidatePath('/admin/proposed')
  } catch (error) {
    console.error('Failed to create proposed dinner:', error)
  }
}

/**
 * Get all dinner requests (for admin)
 */
export async function getAllDinnerRequests(): Promise<Array<{
  id: string
  createdAt: Date
  status: DinnerRequestStatus
  city: string
  name: string
  phone: string
  email: string | null
  isCouple: boolean
  partnerName: string | null
}>> {
  const requests = await prisma.dinnerRequest.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      createdAt: true,
      status: true,
      city: true,
      name: true,
      phone: true,
      email: true,
      isCouple: true,
      partnerName: true,
    },
  })

  return requests
}

/**
 * Get all proposed dinners (for admin)
 */
export async function getAllProposedDinners(): Promise<Array<{
  id: string
  createdAt: Date
  status: string
  city: string
  scheduledAt: Date | null
  eventId: string | null
  memberCount: number
  confirmedCount: number
}>> {
  const proposed = await prisma.proposedDinner.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      createdAt: true,
      status: true,
      city: true,
      scheduledAt: true,
      eventId: true,
      members: {
        select: {
          confirmed: true,
        },
      },
    },
  })

  return proposed.map(p => ({
    id: p.id,
    createdAt: p.createdAt,
    status: p.status,
    city: p.city,
    scheduledAt: p.scheduledAt,
    eventId: p.eventId,
    memberCount: p.members.length,
    confirmedCount: p.members.filter(m => m.confirmed).length,
  }))
}
