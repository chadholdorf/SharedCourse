# Bay Area Supper Club

A Next.js application for organizing and managing dinner events in the Bay Area.

## Environment Setup

### Required Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

#### Database (Required)

Get these from your Supabase project dashboard:

- `DATABASE_URL` - Connection string with pgBouncer (for queries)
- `DIRECT_URL` - Direct connection (for migrations)

#### Admin Access (Required)

- `ADMIN_TOKEN` - Secret token for accessing admin routes

#### Twilio SMS (Optional)

The app will run in **stub mode** if these are not configured (SMS messages logged to console only):

- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number in E.164 format (e.g., +14155551234)

**Where to get Twilio credentials:**
1. Sign up at [twilio.com/console](https://www.twilio.com/console)
2. Get Account SID and Auth Token from the console homepage
3. Buy a phone number with SMS capability

**Setting environment variables:**

- **Local development**: Add to `.env.local` (not committed to git)
- **Vercel deployment**: Add in Vercel dashboard → Project → Settings → Environment Variables

### Running the Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Database Setup

```bash
# Push schema to database
npx prisma db push

# Open Prisma Studio to view data
npx prisma studio
```

## OTP/SMS Verification Testing

### Development Mode Features

When running in development (`NODE_ENV !== 'production'`):

1. **Console Logging**: OTP codes are logged to the server console
2. **Database Storage**: Raw OTP codes stored in `otpDebugCode` field
3. **UI Display**: OTP code shown on verification page with "🔧 Dev Only" label
4. **Stub Mode Fallback**: If Twilio not configured, SMS logs to console and returns success

### Test Plan

#### 1. Check Twilio Configuration

Visit the debug endpoint (admin token required):

```
http://localhost:3000/api/debug/sms?token=YOUR_ADMIN_TOKEN
```

Expected response:
```json
{
  "twilioEnabled": true,
  "hasAccountSid": true,
  "hasAuthToken": true,
  "hasFromNumber": true,
  "accountSidPrefix": "AC1234...",
  "fromNumber": "+14155551234",
  "environment": "development",
  "vercelEnv": "not-vercel"
}
```

#### 2. Trigger OTP Send

1. Navigate to `/join`
2. Enter name and phone number
3. Submit the form
4. Check server logs for:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📱 SMS Send Attempt
   Environment: development
   Twilio Enabled: true
   Account SID: AC1234...
   From Number: ***1234
   To Number: +14155551234****
   Message Length: 64 chars
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔐 OTP Code generated for +14155551234
      DEV MODE: Code is 123456
   ```

#### 3. Verify SMS Delivery

**If Twilio is configured:**
- Check your phone for SMS
- Server logs should show: `✅ SMS SENT SUCCESSFULLY` with Message SID
- If using trial account, destination number must be verified in Twilio console

**If Twilio is NOT configured:**
- Server logs show: `📱 SMS STUB MODE (Twilio not configured)`
- OTP code still logged to console
- Verification page shows code in yellow "Dev Only" box

#### 4. Test Verification Flow

1. On `/join/verify` page:
   - In dev mode: See yellow box with OTP code
   - Enter the 6-digit code
   - Submit verification
2. Should redirect to `/join/onboarding` on success

#### 5. Test Error Handling

**Invalid phone format:**
- Enter non-E.164 phone (e.g., "123456")
- Server logs: `❌ INVALID PHONE FORMAT`

**SMS send failure:**
- Temporarily break Twilio credentials
- UI shows: "We couldn't send a code right now. Please try again in a minute."
- "Try again" button allows retry

**Rate limiting:**
- Request code again within 30 seconds
- Should show: "Please wait X seconds before requesting another code."

#### 6. Common Twilio Errors

**Error 21608** - From number not SMS-capable
```
⚠️  FROM NUMBER NOT SMS CAPABLE
The From number must be SMS-enabled in Twilio
```

**Error 21211** - Invalid destination (trial account)
```
⚠️  INVALID TO NUMBER
If using trial account, number must be verified in Twilio console
```

**Error 20003** - Authentication error
```
⚠️  AUTHENTICATION ERROR
Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
```

### Production Considerations

In production (`NODE_ENV === 'production'`):
- ❌ OTP codes NOT logged to console
- ❌ `otpDebugCode` field is NULL
- ❌ No dev mode UI display
- ✅ SMS failures return error to user
- ✅ User must receive real SMS

## Admin Routes

Admin routes are protected by token authentication:

- `/admin/events` - Event management
- `/admin/ops` - Match request debugging
- `/api/debug/sms` - SMS configuration status

Access via query parameter: `?token=YOUR_ADMIN_TOKEN`

## Architecture

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Authentication**: Phone-based with SMS verification (no email)
- **SMS**: Twilio with fallback stub mode
- **Styling**: Tailwind CSS
- **Forms**: Server Actions with Zod validation

## Key Features

- Phone-only authentication with OTP verification
- Event RSVP system
- Dinner matching algorithm (Sprint 2)
- SMS confirmation workflow
- Admin dashboard

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
