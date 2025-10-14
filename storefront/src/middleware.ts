import { NextRequest, NextResponse } from "next/server"

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
const UTM_COOKIE_NAME = 'ysh_utm_params'
const UTM_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days
const EXP_BUCKET_COOKIE = 'ysh_exp_bucket'

/**
 * Production-grade middleware with UTM lifecycle, A/B experiments, and region handling
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { searchParams } = request.nextUrl

  // 1. UTM Parameter Lifecycle - Capture and persist
  const utmData: Record<string, string> = {}
  let hasNewUtm = false

  for (const param of UTM_PARAMS) {
    const value = searchParams.get(param)
    if (value) {
      utmData[param] = value
      hasNewUtm = true
    }
  }

  // If new UTM params, store in cookie (7 days)
  if (hasNewUtm) {
    response.cookies.set(UTM_COOKIE_NAME, JSON.stringify(utmData), {
      maxAge: UTM_COOKIE_MAX_AGE,
      httpOnly: false, // Allow client JS to read for analytics
      sameSite: 'lax',
      path: '/',
    })
  }

  // 2. A/B Experiment Bucket Assignment (50/50)
  if (!request.cookies.has(EXP_BUCKET_COOKIE)) {
    const bucket = Math.random() < 0.5 ? 'A' : 'B'
    response.cookies.set(EXP_BUCKET_COOKIE, bucket, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    })
  }

  // 3. Region/Country Code Handling (Mock in dev, real from geo in prod)
  const isDev = process.env.NODE_ENV === 'development'
  const pathname = request.nextUrl.pathname

  // Check if path already has country code
  const hasCountryCode = pathname.match(/^\/(br|us|es|pt|mx)(\/|$)/i)

  // If no country code in path and not just country code alone, add it
  if (!hasCountryCode && pathname !== '/' && !pathname.match(/^\/(br|us|es|pt|mx)$/i)) {
    const defaultCountry = isDev ? 'br' : 'br' // In prod, could use request.geo?.country

    // Preserve UTM params and query string in redirect
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultCountry}${pathname}`

    return NextResponse.redirect(url)
  }

  // If pathname is just root or just country code, redirect to country homepage
  if (pathname === '/' || pathname.match(/^\/(br|us|es|pt|mx)$/i)) {
    const country = pathname === '/' ? (isDev ? 'br' : 'br') : pathname.slice(1)
    const url = request.nextUrl.clone()
    url.pathname = `/${country}/`

    return NextResponse.redirect(url)
  }

  // 4. Legacy SEO redirects with UTM preservation
  if (pathname === '/products' || pathname === '/br/products') {
    const url = request.nextUrl.clone()
    url.pathname = '/br/store'
    // UTM params are automatically preserved in url.searchParams
    return NextResponse.redirect(url, 301)
  }

  // 5. Catalog redirects (pt-BR specific)
  if (pathname === '/catalogo' || pathname === '/br/catalogo') {
    const url = request.nextUrl.clone()
    url.pathname = '/br/categories'
    return NextResponse.redirect(url, 301)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - static files (_next/static, _next/image)
     * - public assets (favicon, images, etc.)
     * - file extensions
     * - manifest and service worker
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|manifest.json|sw.js|.*\\.[a-z]{2,4}).*)",
  ],
}
