/**
 * SMS Service Abstraction
 *
 * Sends SMS messages via Twilio if credentials are configured,
 * otherwise logs to console (stub mode for development).
 */

interface SmsMessage {
  to: string
  message: string
}

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

  // Validate E.164 format
  const e164Regex = /^\+[1-9]\d{1,14}$/
  if (!e164Regex.test(to)) {
    console.error(`Invalid phone number format: ${to}. Expected E.164 format (e.g., +14155551234)`)
    return false
  }

  // If Twilio is configured, send real SMS
  if (accountSid && authToken && fromNumber) {
    try {
      // Dynamically import Twilio to avoid errors if not installed
      const twilio = await import('twilio')
      const client = twilio.default(accountSid, authToken)

      await client.messages.create({
        body: message,
        from: fromNumber,
        to: to,
      })

      console.log(`✅ SMS sent to ${to}`)
      return true
    } catch (error) {
      console.error('Failed to send SMS via Twilio:', error)
      return false
    }
  }

  // SMS stub - log to console
  console.log('\n📱 SMS STUB - Would send:')
  console.log(`   To: ${to}`)
  console.log(`   Message: ${message}`)
  console.log('   (Configure TWILIO_* env vars to send real SMS)\n')

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

