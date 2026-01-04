import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatPhoneE164 } from '@/lib/phone-utils'

/**
 * DEV-ONLY: Reset a phone number for testing
 *
 * POST /api/dev/reset-phone
 * Auth: x-admin-token header OR ?token= query param
 * Body: { "phone": "(415) 734-8009" } (any format, normalized to E.164)
 *
 * Deletes Member + all dependent records to allow re-signup.
 * Only works when NODE_ENV !== "production" (returns 404 in prod).
 */
export async function POST(request: NextRequest) {
  // Production safety: return 404
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Check admin token (header or query param)
  const headerToken = request.headers.get('x-admin-token')
  const queryToken = request.nextUrl.searchParams.get('token')
  const token = headerToken || queryToken

  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken || token !== adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const rawPhone = body.phone

    if (!rawPhone) {
      return NextResponse.json(
        { error: 'Missing phone in request body' },
        { status: 400 }
      )
    }

    // Normalize to E.164
    const phone = formatPhoneE164(rawPhone)

    console.log(`🔧 [DEV RESET] Starting reset for phone: ${phone}`)

    let deletedMember = false
    let deletedOtps = 0
    let deletedRequests = 0
    let deletedMatches = 0

    // Delete OTP verification codes
    const otpResult = await prisma.phoneVerificationCode.deleteMany({
      where: { phone },
    })
    deletedOtps = otpResult.count
    console.log(`   Deleted ${deletedOtps} OTP codes`)

    // Find member
    const member = await prisma.member.findUnique({
      where: { phone },
      include: {
        matchRequests: true,
      },
    })

    if (member) {
      // Delete dinner matches where this member is involved
      const matchRequestIds = member.matchRequests.map((req) => req.id)

      if (matchRequestIds.length > 0) {
        const matchResult = await prisma.dinnerMatch.deleteMany({
          where: {
            OR: [
              { requestAId: { in: matchRequestIds } },
              { requestBId: { in: matchRequestIds } },
            ],
          },
        })
        deletedMatches = matchResult.count
        console.log(`   Deleted ${deletedMatches} dinner matches`)
      }

      // Delete match requests
      const requestResult = await prisma.matchRequest.deleteMany({
        where: { memberId: member.id },
      })
      deletedRequests = requestResult.count
      console.log(`   Deleted ${deletedRequests} match requests`)

      // Delete RSVPs (by phone, not FK)
      const rsvpResult = await prisma.rsvp.deleteMany({
        where: { phone },
      })
      console.log(`   Deleted ${rsvpResult.count} RSVPs`)

      // Delete dinner requests (by phone, not FK)
      const dinnerReqResult = await prisma.dinnerRequest.deleteMany({
        where: { phone },
      })
      console.log(`   Deleted ${dinnerReqResult.count} dinner requests`)

      // Delete proposed dinner members (by phone, not FK)
      const proposedResult = await prisma.proposedDinnerMember.deleteMany({
        where: { phone },
      })
      console.log(`   Deleted ${proposedResult.count} proposed dinner memberships`)

      // Finally delete member
      await prisma.member.delete({
        where: { id: member.id },
      })
      deletedMember = true
      console.log(`   Deleted member account`)
    } else {
      console.log(`   No member found for ${phone}`)
    }

    console.log(`✅ [DEV RESET] Complete for ${phone}`)

    return NextResponse.json({
      ok: true,
      phone,
      deleted: {
        member: deletedMember,
        otps: deletedOtps,
        requests: deletedRequests,
        matches: deletedMatches,
      },
    })
  } catch (error) {
    console.error('❌ [DEV RESET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to reset phone', details: String(error) },
      { status: 500 }
    )
  }
}
