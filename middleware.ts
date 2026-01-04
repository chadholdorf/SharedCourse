import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const headerToken = request.headers.get('x-admin-token')
    const queryToken = request.nextUrl.searchParams.get('token')
    const validToken = process.env.ADMIN_TOKEN

    if (!validToken) {
      console.error('ADMIN_TOKEN not configured in environment variables')
      return NextResponse.json(
        { error: 'Server misconfiguration' },
        { status: 500 }
      )
    }

    if (headerToken !== validToken && queryToken !== validToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing admin token' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
