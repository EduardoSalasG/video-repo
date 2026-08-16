import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'video_repo_token'

const protectedPrefixes = ['/library', '/search', '/progress', '/admin']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(SESSION_COOKIE)?.value

  if (protectedPrefixes.some((p) => pathname.startsWith(p)) && !token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  if ((pathname === '/login' || pathname === '/register') && token) {
    const url = req.nextUrl.clone()
    url.pathname = '/library'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/library/:path*', '/search/:path*', '/progress/:path*', '/admin/:path*', '/login', '/register'],
}