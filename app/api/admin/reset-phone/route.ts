import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatPhoneE164 } from '@/lib/phone-utils'

/**
 * Admin-only endpoint to reset a phone number for testing
 *
 * POST /api/admin/reset-phone
 * Auth: ADMIN_TOKEN (header: x-admin-token OR query: ?token=)
 * Body: { "phone": "+14157348009" }
 *
 * Deletes Member + all dependent records to allow re-signup.
 * Works in both development and production.
 */
export async function POST(request: NextRequest) {
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

    console.log(`🔧 Admin reset phone ${phone}`)

    let deletedMember = false
    let deletedOtps = 0
    let deletedRequests = 0
    let deletedMatches = 0

    // Delete OTP verification codes
    const otpResult = await prisma.phoneVerificationCode.deleteMany({
      where: { phone },
    })
    deletedOtps = otpResult.count

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
      }

      // Delete match requests
      const requestResult = await prisma.matchRequest.deleteMany({
        where: { memberId: member.id },
      })
      deletedRequests = requestResult.count

      // Delete RSVPs (by phone, not FK)
      await prisma.rsvp.deleteMany({
        where: { phone },
      })

      // Delete dinner requests (by phone, not FK)
      await prisma.dinnerRequest.deleteMany({
        where: { phone },
      })

      // Delete proposed dinner members (by phone, not FK)
      await prisma.proposedDinnerMember.deleteMany({
        where: { phone },
      })

      // Finally delete member
      await prisma.member.delete({
        where: { id: member.id },
      })
      deletedMember = true
    }

    console.log(`✅ Admin reset complete for ${phone}`)

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
    console.error('❌ Admin reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset phone', details: String(error) },
      { status: 500 }
    )
  }
}
