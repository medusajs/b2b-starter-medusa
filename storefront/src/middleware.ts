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

  // If no country code in path, add mock 'br' in dev or detect in prod
  if (!pathname.match(/^\/(br|us|es|pt|mx)\//i)) {
    const defaultCountry = isDev ? 'br' : 'br' // In prod, could use request.geo?.country

    // Preserve UTM params and query string in redirect
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultCountry}${pathname}`

    return NextResponse.redirect(url)
  }

  // 4. Legacy SEO redirects (prevent loops)
  if (pathname === '/products' || pathname === '/br/products') {
    const url = request.nextUrl.clone()
    url.pathname = '/br/store'
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|.*\\.[a-z]{2,4}).*)",
  ],
}
