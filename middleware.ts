import { NextRequest, NextResponse } from 'next/server'

const locales = ['en', 'fr']
const defaultLocale = 'en'

function getLocale(request: NextRequest): string {
  // Check if locale is in cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value
  if (localeCookie && locales.includes(localeCookie)) {
    return localeCookie
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')[0]
      .split('-')[0]
      .toLowerCase()
    if (locales.includes(preferredLocale)) {
      return preferredLocale
    }
  }

  return defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip if pathname already has a locale or is an API/static route
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // Redirect to locale-prefixed URL
  const locale = getLocale(request)
  const newUrl = new URL(`/${locale}${pathname}`, request.url)

  const response = NextResponse.redirect(newUrl)
  response.cookies.set('NEXT_LOCALE', locale, { maxAge: 31536000 })

  return response
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
