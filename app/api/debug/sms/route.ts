import { NextRequest, NextResponse } from 'next/server'

/**
 * SMS Debug Endpoint - Admin gated
 * 
 * Usage: GET /api/debug/sms?token=YOUR_ADMIN_TOKEN
 * 
 * Returns Twilio configuration status without exposing secrets
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  // Check admin token
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken || token !== adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  const twilioEnabled = !!(accountSid && authToken && fromNumber)

  return NextResponse.json({
    twilioEnabled,
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    hasFromNumber: !!fromNumber,
    accountSidPrefix: accountSid ? accountSid.slice(0, 6) + '...' : null,
    fromNumber: fromNumber || null,
    environment: process.env.NODE_ENV || 'development',
    vercelEnv: process.env.VERCEL_ENV || 'not-vercel',
  })
}
