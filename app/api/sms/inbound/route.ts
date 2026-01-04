import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSms } from '@/lib/sms'

/**
 * Inbound SMS Webhook for YES/NO match confirmations
 *
 * Twilio webhook configuration:
 * URL: https://your-domain.com/api/sms/inbound
 * Method: POST
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') as string
    const body = formData.get('Body') as string

    console.log(`📱 Inbound SMS from ${from}: ${body}`)

    if (!from || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Normalize message
    const message = body.trim().toUpperCase()

    // Find the most recent pending match for this phone
    const match = await prisma.dinnerMatch.findFirst({
      where: {
        status: 'PENDING_CONFIRMATION',
        OR: [
          { phoneA: from },
          { phoneB: from },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        requestA: {
          include: {
            member: {
              select: { phone: true, fullName: true },
            },
          },
        },
        requestB: {
          include: {
            member: {
              select: { phone: true, fullName: true },
            },
          },
        },
      },
    })

    if (!match) {
      // No pending match found
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No pending dinner match found.</Message></Response>',
        { headers: { 'Content-Type': 'text/xml' } }
      )
    }

    // Handle YES confirmation
    if (message.startsWith('YES') || message === 'Y') {
      const isPhoneA = match.phoneA === from

      // Update confirmation timestamp
      await prisma.dinnerMatch.update({
        where: { id: match.id },
        data: isPhoneA
          ? { confirmAAt: new Date() }
          : { confirmBAt: new Date() },
      })

      // Check if both have confirmed
      const updatedMatch = await prisma.dinnerMatch.findUnique({
        where: { id: match.id },
      })

      const bothConfirmed = updatedMatch?.confirmAAt && updatedMatch?.confirmBAt

      if (bothConfirmed) {
        // Both confirmed! Mark match as CONFIRMED
        await prisma.dinnerMatch.update({
          where: { id: match.id },
          data: { status: 'CONFIRMED' },
        })

        // Mark both requests as CONFIRMED
        await prisma.matchRequest.updateMany({
          where: {
            id: { in: [match.requestAId, match.requestBId] },
          },
          data: { status: 'CONFIRMED' },
        })

        // Send confirmation to both
        const confirmMessage = "Confirmed! We'll text you next steps shortly."
        await sendSms(match.phoneA, confirmMessage)
        await sendSms(match.phoneB, confirmMessage)

        console.log(`✅ Match ${match.id} fully confirmed!`)

        return new NextResponse(
          '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
          { headers: { 'Content-Type': 'text/xml' } }
        )
      } else {
        // Only one confirmed, waiting for the other
        return new NextResponse(
          '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Got it. Waiting on the other person.</Message></Response>',
          { headers: { 'Content-Type': 'text/xml' } }
        )
      }
    }

    // Handle NO rejection
    if (message.startsWith('NO') || message === 'N') {
      const isPhoneA = match.phoneA === from
      const otherPhone = isPhoneA ? match.phoneB : match.phoneA

      // Cancel the match
      await prisma.dinnerMatch.update({
        where: { id: match.id },
        data: {
          status: 'CANCELED',
          canceledReason: `${from} declined`,
        },
      })

      // Set both requests back to OPEN (they can be rematched)
      await prisma.matchRequest.updateMany({
        where: {
          id: { in: [match.requestAId, match.requestBId] },
        },
        data: {
          status: 'OPEN',
          matchId: null,
        },
      })

      // Send messages
      await sendSms(from, "No worries. You're back in the pool.")
      await sendSms(otherPhone, "The other person passed. We'll keep looking.")

      console.log(`❌ Match ${match.id} canceled by ${from}`)

      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { 'Content-Type': 'text/xml' } }
      )
    }

    // Unknown message
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Reply YES to confirm or NO to pass.</Message></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    )
  } catch (error) {
    console.error('SMS webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
