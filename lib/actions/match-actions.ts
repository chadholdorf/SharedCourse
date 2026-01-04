'use server'

import { prisma } from '@/lib/prisma'
import { sendSms } from '@/lib/sms'
import { z } from 'zod'

export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const createMatchRequestSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  region: z.enum(['NORTH_BAY', 'SAN_FRANCISCO', 'EAST_BAY', 'SOUTH_BAY']),
  timeWindow: z.enum(['THIS_WEEK', 'NEXT_WEEK', 'FLEXIBLE']),
  partyType: z.enum(['SOLO', 'COUPLE']),
  matchPreference: z.enum(['SOLO_ONLY', 'COUPLE_ONLY', 'OPEN']),
})

export type CreateMatchRequestInput = z.infer<typeof createMatchRequestSchema>

/**
 * Create a dinner match request and attempt to match immediately
 */
export async function createMatchRequest(
  input: CreateMatchRequestInput
): Promise<ActionResponse<{ requestId: string; matched: boolean }>> {
  try {
    const validated = createMatchRequestSchema.parse(input)

    // Find member by phone
    const member = await prisma.member.findUnique({
      where: { phone: validated.phone },
    })

    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    // Create the match request
    const request = await prisma.matchRequest.create({
      data: {
        memberId: member.id,
        region: validated.region,
        timeWindow: validated.timeWindow,
        partyType: validated.partyType,
        matchPreference: validated.matchPreference,
        status: 'OPEN',
      },
    })

    // Immediately try to match
    await tryMatchForRequest(request.id)

    // Check if we got matched
    const updatedRequest = await prisma.matchRequest.findUnique({
      where: { id: request.id },
      select: { status: true },
    })

    const matched = updatedRequest?.status === 'MATCHED_PENDING_CONFIRMATION'

    return {
      success: true,
      data: { requestId: request.id, matched },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Create match request error:', error)
    return { success: false, error: 'Failed to create request' }
  }
}

/**
 * Matching algorithm: Find a compatible request and create a match
 */
export async function tryMatchForRequest(requestId: string): Promise<void> {
  try {
    const request = await prisma.matchRequest.findUnique({
      where: { id: requestId },
      include: { member: true },
    })

    if (!request || request.status !== 'OPEN') {
      return
    }

    // Find compatible requests (FIFO - oldest first)
    const potentialMatches = await prisma.matchRequest.findMany({
      where: {
        status: 'OPEN',
        region: request.region,
        id: { not: requestId },
        memberId: { not: request.memberId },
      },
      include: { member: true },
      orderBy: { createdAt: 'asc' },
    })

    // Apply matching rules
    for (const candidate of potentialMatches) {
      if (isCompatible(request, candidate)) {
        // Create the match!
        await createMatch(request, candidate)
        return
      }
    }
  } catch (error) {
    console.error('Match attempt error:', error)
  }
}

type MatchRequestWithMember = {
  id: string
  partyType: string
  matchPreference: string
  timeWindow: string
  region: string
  member: { phone: string }
}

/**
 * Check if two requests are compatible
 */
function isCompatible(
  requestA: MatchRequestWithMember,
  requestB: MatchRequestWithMember
): boolean {
  // Rule 1: Same region (already filtered in query)

  // Rule 2: Compatible party types
  const partyMatch = checkPartyCompatibility(
    requestA.partyType,
    requestA.matchPreference,
    requestB.partyType,
    requestB.matchPreference
  )

  if (!partyMatch) return false

  // Rule 3: Compatible time windows
  const timeMatch = checkTimeCompatibility(requestA.timeWindow, requestB.timeWindow)

  if (!timeMatch) return false

  return true
}

/**
 * Check party type compatibility
 */
function checkPartyCompatibility(
  partyA: string,
  prefA: string,
  partyB: string,
  prefB: string
): boolean {
  // SOLO_ONLY matches only SOLO
  if (prefA === 'SOLO_ONLY' && partyB !== 'SOLO') return false
  if (prefB === 'SOLO_ONLY' && partyA !== 'SOLO') return false

  // COUPLE_ONLY matches only COUPLE
  if (prefA === 'COUPLE_ONLY' && partyB !== 'COUPLE') return false
  if (prefB === 'COUPLE_ONLY' && partyA !== 'COUPLE') return false

  // OPEN matches either
  return true
}

/**
 * Check time window compatibility
 */
function checkTimeCompatibility(timeA: string, timeB: string): boolean {
  // FLEXIBLE matches anything
  if (timeA === 'FLEXIBLE' || timeB === 'FLEXIBLE') return true

  // THIS_WEEK matches THIS_WEEK
  if (timeA === 'THIS_WEEK' && timeB === 'THIS_WEEK') return true

  // NEXT_WEEK matches NEXT_WEEK
  if (timeA === 'NEXT_WEEK' && timeB === 'NEXT_WEEK') return true

  return false
}

/**
 * Create a match between two requests
 */
async function createMatch(requestA: MatchRequestWithMember, requestB: MatchRequestWithMember): Promise<void> {
  try {
    const match = await prisma.dinnerMatch.create({
      data: {
        requestAId: requestA.id,
        requestBId: requestB.id,
        phoneA: requestA.member.phone,
        phoneB: requestB.member.phone,
        status: 'PENDING_CONFIRMATION',
      },
    })

    // Update both requests
    await prisma.matchRequest.updateMany({
      where: {
        id: { in: [requestA.id, requestB.id] },
      },
      data: {
        status: 'MATCHED_PENDING_CONFIRMATION',
        matchId: match.id,
      },
    })

    // Send SMS to both parties
    const regionName = getRegionName(requestA.region)
    const timeDesc = getTimeDescription(requestA.timeWindow, requestB.timeWindow)

    const message = `We found someone for dinner in ${regionName} ${timeDesc}. Reply YES to confirm or NO to pass.`

    await sendSms(requestA.member.phone, message)
    await sendSms(requestB.member.phone, message)

    console.log(`✅ Match created: ${match.id}`)
  } catch (error) {
    console.error('Failed to create match:', error)
  }
}

/**
 * Get human-readable region name
 */
function getRegionName(region: string): string {
  const map: Record<string, string> = {
    NORTH_BAY: 'North Bay',
    SAN_FRANCISCO: 'San Francisco',
    EAST_BAY: 'East Bay',
    SOUTH_BAY: 'South Bay',
  }
  return map[region] || region
}

/**
 * Get time description for match
 */
function getTimeDescription(timeA: string, timeB: string): string {
  if (timeA === 'THIS_WEEK' || timeB === 'THIS_WEEK') return 'this week'
  if (timeA === 'NEXT_WEEK' || timeB === 'NEXT_WEEK') return 'next week'
  return 'soon'
}

/**
 * Get all match requests for admin view
 */
export async function getAllMatchRequests(limit: number = 50) {
  return await prisma.matchRequest.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      member: {
        select: {
          phone: true,
          fullName: true,
        },
      },
    },
  })
}

/**
 * Get all dinner matches for admin view
 */
export async function getAllDinnerMatches(limit: number = 50) {
  return await prisma.dinnerMatch.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      requestA: {
        include: {
          member: {
            select: {
              phone: true,
              fullName: true,
            },
          },
        },
      },
      requestB: {
        include: {
          member: {
            select: {
              phone: true,
              fullName: true,
            },
          },
        },
      },
    },
  })
}
