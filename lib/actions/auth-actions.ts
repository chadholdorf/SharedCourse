'use server'

import { prisma } from '@/lib/prisma'
import { formatPhoneE164 } from '@/lib/phone-utils'
import { sendSms } from '@/lib/sms'
import { z } from 'zod'
import crypto from 'crypto'

export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const createAccountSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  agreedToTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
})

const verifyCodeSchema = z.object({
  phone: z.string().min(1),
  code: z.string().length(6, 'Code must be 6 digits'),
})

/**
 * Generate a 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Hash a verification code for storage
 */
function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

/**
 * Step 1: Create account and send verification code
 */
export async function createAccount(
  input: z.infer<typeof createAccountSchema>
): Promise<ActionResponse<{ phone: string }>> {
  try {
    const validated = createAccountSchema.parse(input)
    const formattedPhone = formatPhoneE164(validated.phone)

    // Check if phone already exists
    const existing = await prisma.member.findUnique({
      where: { phone: formattedPhone },
    })

    if (existing) {
      return {
        success: false,
        error: 'This phone number is already registered.',
      }
    }

    // Create member record (unverified)
    await prisma.member.create({
      data: {
        phone: formattedPhone,
        fullName: validated.fullName,
        status: 'waitlist',
      },
    })

    // Send verification code
    const result = await sendVerificationCode(formattedPhone)

    if (!result.success) {
      return result
    }

    return {
      success: true,
      data: { phone: formattedPhone },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Create account error:', error)
    return { success: false, error: 'Failed to create account' }
  }
}

/**
 * Send or resend verification code
 */
export async function sendVerificationCode(
  phone: string
): Promise<ActionResponse<{ phone: string }>> {
  try {
    const formattedPhone = formatPhoneE164(phone)
    const isProduction = process.env.NODE_ENV === 'production'

    // Production safety: Check Twilio credentials
    if (isProduction) {
      const hasAccountSid = !!process.env.TWILIO_ACCOUNT_SID
      const hasAuthToken = !!process.env.TWILIO_AUTH_TOKEN
      const hasFromNumber = !!process.env.TWILIO_PHONE_NUMBER

      if (!hasAccountSid || !hasAuthToken || !hasFromNumber) {
        console.error('🚨 FATAL: Twilio credentials missing in production')
        console.error(`   TWILIO_ACCOUNT_SID: ${hasAccountSid ? 'SET' : 'MISSING'}`)
        console.error(`   TWILIO_AUTH_TOKEN: ${hasAuthToken ? 'SET' : 'MISSING'}`)
        console.error(`   TWILIO_PHONE_NUMBER: ${hasFromNumber ? 'SET' : 'MISSING'}`)
        return {
          success: false,
          error: "We couldn't send a text. Please try again in a moment.",
        }
      }
    }

    // Check rate limit on resends
    const recentCode = await prisma.phoneVerificationCode.findFirst({
      where: {
        phone: formattedPhone,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (recentCode?.lastResendAt) {
      const secondsSinceResend = (Date.now() - recentCode.lastResendAt.getTime()) / 1000
      if (secondsSinceResend < 30) {
        return {
          success: false,
          error: `Please wait ${Math.ceil(30 - secondsSinceResend)} seconds before requesting another code.`,
        }
      }
    }

    // Generate new code
    const code = generateVerificationCode()
    const codeHash = hashCode(code)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store verification code
    await prisma.phoneVerificationCode.create({
      data: {
        phone: formattedPhone,
        codeHash,
        expiresAt,
        lastResendAt: new Date(),
        // Store raw code in dev mode ONLY for debugging
        otpDebugCode: isProduction ? null : code,
      },
    })

    // Log OTP generation (production-safe - no code logged in prod)
    console.log(`🔐 OTP Code generated for ${formattedPhone}`)
    if (!isProduction) {
      console.log(`   DEV MODE: Code is ${code}`)
    }

    // Send SMS via Twilio
    console.log(`📤 OTP SMS sending to ${formattedPhone}`)
    const smsSuccess = await sendSms(
      formattedPhone,
      `Your Bay Area Supper Club verification code is: ${code}`
    )

    if (!smsSuccess) {
      console.error(`❌ OTP SMS failed for ${formattedPhone}`)

      // Production: Always return error if SMS fails
      if (isProduction) {
        return {
          success: false,
          error: "We couldn't send a text. Please try again in a moment.",
        }
      }

      // Dev: Allow proceeding with on-screen code
      console.log('   ℹ️  Proceeding anyway in dev mode - code stored in DB')
    } else {
      console.log(`✅ OTP SMS sent successfully to ${formattedPhone}`)
    }

    return {
      success: true,
      data: { phone: formattedPhone },
    }
  } catch (error) {
    console.error('Send verification code error:', error)
    return { success: false, error: 'Failed to send verification code' }
  }
}

/**
 * Verify the 6-digit code
 */
export async function verifyCode(
  input: z.infer<typeof verifyCodeSchema>
): Promise<ActionResponse<{ verified: true }>> {
  try {
    const validated = verifyCodeSchema.parse(input)
    const formattedPhone = formatPhoneE164(validated.phone)

    // Find the most recent unverified code
    const record = await prisma.phoneVerificationCode.findFirst({
      where: {
        phone: formattedPhone,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      return {
        success: false,
        error: 'Verification code expired or not found. Please request a new code.',
      }
    }

    // Check attempt limit
    if (record.attempts >= 5) {
      return {
        success: false,
        error: 'Too many incorrect attempts. Please request a new code.',
      }
    }

    // Verify code
    const codeHash = hashCode(validated.code)

    if (codeHash !== record.codeHash) {
      // Increment attempts
      await prisma.phoneVerificationCode.update({
        where: { id: record.id },
        data: { attempts: record.attempts + 1 },
      })

      return {
        success: false,
        error: `Incorrect code. ${4 - record.attempts} attempts remaining.`,
      }
    }

    // Mark as verified
    await prisma.phoneVerificationCode.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    })

    return {
      success: true,
      data: { verified: true },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Verify code error:', error)
    return { success: false, error: 'Failed to verify code' }
  }
}

/**
 * Check if a phone number has been verified
 */
export async function isPhoneVerified(phone: string): Promise<boolean> {
  const formattedPhone = formatPhoneE164(phone)

  const verified = await prisma.phoneVerificationCode.findFirst({
    where: {
      phone: formattedPhone,
      verifiedAt: { not: null },
    },
  })

  return !!verified
}

/**
 * Get debug OTP code (development only)
 * Returns null in production for safety
 */
export async function getDebugOtpCode(phone: string): Promise<string | null> {
  // Production safety: Never return debug codes in production
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const formattedPhone = formatPhoneE164(phone)

  const code = await prisma.phoneVerificationCode.findFirst({
    where: {
      phone: formattedPhone,
      verifiedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
    select: { otpDebugCode: true },
  })

  return code?.otpDebugCode || null
}
