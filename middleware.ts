import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-this-in-production'
)

// Routes that should bypass middleware entirely
const PUBLIC_FILE = /\.(.*)$/
const BYPASSED_PATHS = ['/admin/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files, Next.js internals, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/uploads') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  // ─── ADMIN PROTECTION ───
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_session')?.value

    // 1. Logged-in user trying to access /admin/login → redirect to dashboard
    if (pathname === '/admin/login') {
      if (token) {
        try {
          await jwtVerify(token, JWT_SECRET)
          return NextResponse.redirect(new URL('/admin', request.url))
        } catch {
          // Invalid token, stay on login page and clear the bad cookie
          const response = NextResponse.next()
          response.cookies.delete('admin_session')
          return response
        }
      }
      return NextResponse.next()
    }

    // 2. Any other /admin/* route requires valid token
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      await jwtVerify(token, JWT_SECRET)
      return NextResponse.next()
    } catch {
      // Token invalid/expired → clear cookie and redirect to login
      const response = NextResponse.redirect(
        new URL('/admin/login', request.url)
      )
      response.cookies.delete('admin_session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}