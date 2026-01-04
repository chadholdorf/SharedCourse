import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatPhoneE164 } from '@/lib/phone-utils'

/**
 * Dev-only endpoint to reset a phone number for testing
 *
 * POST /api/admin/dev-reset-phone?token=sharedcourse-admin-secret-2024
 * Body: { "phone": "+14157348009" }
 *
 * Deletes all records for a phone to allow re-signup:
 * - Member account
 * - Verification codes
 * - Match requests and matches
 * - Dinner requests
 * - RSVPs
 * - Proposed dinner memberships
 */
export async function POST(request: NextRequest) {
  // Only allow in non-production
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not Found', { status: 404 })
  }

  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  // Check admin token
  const expectedToken = 'sharedcourse-admin-secret-2024'
  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const phone = formatPhoneE164(body.phone)

    console.log(`🔧 [DEV RESET] Starting reset for phone: ${phone}`)

    let deletedMember = false
    let deletedOtps = 0
    let deletedRequests = 0
    let deletedMatches = 0

    // Find member
    const member = await prisma.member.findUnique({
      where: { phone },
      include: {
        matchRequests: true,
      },
    })

    // Delete verification codes
    const otpResult = await prisma.phoneVerificationCode.deleteMany({
      where: { phone },
    })
    deletedOtps = otpResult.count
    console.log(`   Deleted ${deletedOtps} OTP codes`)

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

      // Delete RSVPs
      const rsvpResult = await prisma.rsvp.deleteMany({
        where: { phone },
      })
      console.log(`   Deleted ${rsvpResult.count} RSVPs`)

      // Delete dinner requests
      const dinnerReqResult = await prisma.dinnerRequest.deleteMany({
        where: { phone },
      })
      console.log(`   Deleted ${dinnerReqResult.count} dinner requests`)

      // Delete proposed dinner members
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
      { error: 'Failed to reset phone' },
      { status: 500 }
    )
  }
}
