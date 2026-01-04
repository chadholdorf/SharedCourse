/**
 * SMS Service Abstraction
 *
 * Sends SMS messages via Twilio if credentials are configured,
 * otherwise logs to console (stub mode for development).
 */

/**
 * Send an SMS message
 *
 * @param to - Phone number in E.164 format (e.g., +14155551234)
 * @param message - Message body
 * @returns Promise<boolean> - true if sent/logged successfully
 */
export async function sendSms(to: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER
  const environment = process.env.NODE_ENV || 'development'

  // Mask sensitive data for logging
  const maskedTo = to.slice(0, -4) + '****'
  const maskedSid = accountSid ? accountSid.slice(0, 6) + '...' : 'NOT_SET'
  const maskedFrom = fromNumber ? '***' + fromNumber.slice(-4) : 'NOT_SET'

  const twilioEnabled = !!(accountSid && authToken && fromNumber)

  // Comprehensive logging for debugging
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📱 SMS Send Attempt')
  console.log(`Environment: ${environment}`)
  console.log(`Twilio Enabled: ${twilioEnabled}`)
  console.log(`Account SID: ${maskedSid}`)
  console.log(`From Number: ${maskedFrom}`)
  console.log(`To Number: ${maskedTo}`)
  console.log(`Message Length: ${message.length} chars`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Validate E.164 format
  const e164Regex = /^\+[1-9]\d{1,14}$/
  if (!e164Regex.test(to)) {
    console.error(`❌ INVALID PHONE FORMAT: ${to}`)
    console.error('Expected E.164 format (e.g., +14155551234)')
    return false
  }

  // If Twilio is configured, send real SMS
  if (twilioEnabled) {
    try {
      // Dynamically import Twilio to avoid errors if not installed
      const twilio = await import('twilio')
      const client = twilio.default(accountSid, authToken)

      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: to,
      })

      console.log(`✅ OTP SMS sent sid=${result.sid} status=${result.status}`)

      // Check for trial account limitations
      if (result.status === 'undelivered' || result.status === 'failed') {
        console.warn(`⚠️  Message status: ${result.status}`)
        console.warn('If using Twilio trial account, destination must be verified')
      }

      return true
    } catch (error: unknown) {
      if (error && typeof error === 'object') {
        const twilioError = error as { code?: number; message?: string; moreInfo?: string; status?: number }

        console.error(`❌ OTP SMS failed error=${twilioError.code || 'unknown'} message="${twilioError.message || 'unknown'}"`)

        // Check for common Twilio errors
        if (twilioError.code === 21608) {
          console.error('⚠️  FROM NUMBER NOT SMS CAPABLE')
          console.error('The From number must be SMS-enabled in Twilio')
        } else if (twilioError.code === 21211) {
          console.error('⚠️  INVALID TO NUMBER')
          console.error('If using trial account, number must be verified in Twilio console')
        } else if (twilioError.code === 20003) {
          console.error('⚠️  AUTHENTICATION ERROR')
          console.error('Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN')
        }

        if (twilioError.moreInfo) {
          console.error(`More info: ${twilioError.moreInfo}`)
        }
      } else {
        console.error(error)
      }

      return false
    }
  }

  // SMS stub - log to console
  console.log('📱 SMS STUB MODE (Twilio not configured)')
  console.log(`   To: ${to}`)
  console.log(`   Message: ${message}`)
  console.log('   ⚠️  Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to send real SMS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return true
}

/**
 * Send SMS notification when a dinner request is created
 */
export async function sendRequestConfirmation(to: string, city: string): Promise<boolean> {
  const message = `You're in the pool for a Shared dinner in ${city}. We'll text you when we find a match.`
  return sendSms(to, message)
}

/**
 * Send SMS notification when a match is found
 */
export async function sendMatchNotification(
  to: string,
  day: string,
  time: string
): Promise<boolean> {
  const message = `We found a potential dinner on ${day} at ${time}. Reply YES to confirm.`
  return sendSms(to, message)
}

