import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * SMS Webhook for handling inbound SMS (Twilio-style)
 *
 * This endpoint receives SMS replies and processes confirmations.
 *
 * For Twilio configuration:
 * 1. Go to Twilio Console > Phone Numbers > Manage > Active Numbers
 * 2. Click on your phone number
 * 3. Under "Messaging", set Webhook URL to: https://your-domain.com/api/sms/webhook
 * 4. Method: POST
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') as string // Sender's phone number
    const body = formData.get('Body') as string // Message text

    console.log(`📱 Incoming SMS from ${from}: ${body}`)

    if (!from || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Normalize message
    const message = body.trim().toUpperCase()

    // Handle YES confirmation
    if (message === 'YES' || message === 'Y') {
      await handleConfirmation(from, true)
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Great! You\'re confirmed. We\'ll send you details soon.</Message></Response>',
        {
          headers: {
            'Content-Type': 'text/xml',
          },
        }
      )
    }

    // Handle NO confirmation
    if (message === 'NO' || message === 'N') {
      await handleConfirmation(from, false)
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Got it. We\'ve removed you from this dinner. Feel free to request again anytime!</Message></Response>',
        {
          headers: {
            'Content-Type': 'text/xml',
          },
        }
      )
    }

    // Unknown message
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Reply YES to confirm or NO to decline.</Message></Response>',
      {
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    )
  } catch (error) {
    console.error('SMS webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Handle YES/NO confirmation from SMS
 */
async function handleConfirmation(phone: string, confirmed: boolean): Promise<void> {
  try {
    // Find the most recent PENDING proposed dinner member for this phone
    const member = await prisma.proposedDinnerMember.findFirst({
      where: {
        phone,
        confirmed: false,
        proposedDinner: {
          status: 'PENDING',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        proposedDinner: true,
        dinnerRequest: true,
      },
    })

    if (!member) {
      console.log(`No pending dinner found for ${phone}`)
      return
    }

    if (confirmed) {
      // Mark as confirmed
      await prisma.proposedDinnerMember.update({
        where: { id: member.id },
        data: {
          confirmed: true,
          confirmedAt: new Date(),
        },
      })

      console.log(`✅ Confirmed: ${phone} for ProposedDinner ${member.proposedDinnerId}`)

      // TODO: Check if all members confirmed, then finalize dinner
    } else {
      // Remove from proposed dinner
      await prisma.proposedDinnerMember.delete({
        where: { id: member.id },
      })

      // Mark request as OPEN again for backfill
      await prisma.dinnerRequest.update({
        where: { id: member.dinnerRequestId },
        data: { status: 'OPEN' },
      })

      console.log(`❌ Declined: ${phone} removed from ProposedDinner ${member.proposedDinnerId}`)

      // TODO: Try to backfill with another request
    }
  } catch (error) {
    console.error('Error handling confirmation:', error)
  }
}
