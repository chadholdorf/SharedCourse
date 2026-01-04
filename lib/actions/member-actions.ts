'use server'

import { prisma } from '@/lib/prisma'
import { formatPhoneE164 } from '@/lib/phone-utils'
import { sendSms } from '@/lib/sms'
import { z } from 'zod'

export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// Validation schema
const joinWaitlistSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
})

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>

/**
 * Join the membership waitlist
 */
export async function joinWaitlist(
  input: JoinWaitlistInput
): Promise<ActionResponse<{ phone: string }>> {
  try {
    const validated = joinWaitlistSchema.parse(input)

    // Format phone to E.164
    const formattedPhone = formatPhoneE164(validated.phone)

    // Check if already on waitlist
    const existing = await prisma.member.findUnique({
      where: { phone: formattedPhone },
    })

    if (existing) {
      return {
        success: false,
        error: "You're already on the list. We'll be in touch.",
      }
    }

    // Create member
    const member = await prisma.member.create({
      data: {
        phone: formattedPhone,
        status: 'waitlist',
      },
    })

    // Send SMS confirmation (or stub)
    await sendSms(
      formattedPhone,
      "You're on the Bay Area Supper Club list. We'll text you when memberships open."
    )

    return {
      success: true,
      data: { phone: formattedPhone },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }

    console.error('Failed to join waitlist:', error)
    return { success: false, error: 'Failed to join waitlist. Please try again.' }
  }
}

/**
 * Check if a phone number is on the waitlist
 */
export async function checkMemberStatus(
  phone: string
): Promise<ActionResponse<{ status: string; exists: boolean }>> {
  try {
    const formattedPhone = formatPhoneE164(phone)

    const member = await prisma.member.findUnique({
      where: { phone: formattedPhone },
      select: { status: true },
    })

    if (!member) {
      return {
        success: true,
        data: { exists: false, status: 'none' },
      }
    }

    return {
      success: true,
      data: { exists: true, status: member.status },
    }
  } catch (error) {
    console.error('Failed to check member status:', error)
    return { success: false, error: 'Failed to check status' }
  }
}
