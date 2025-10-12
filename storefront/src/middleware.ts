import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Em desenvolvimento, usar regiões mockadas para evitar dependência do backend
    if (process.env.NODE_ENV === "development") {
      const mockRegions = [
        {
          id: "reg_01H8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z",
          countries: [{ iso_2: "us" }, { iso_2: "br" }],
        },
      ]

      mockRegions.forEach((region: any) => {
        region.countries?.forEach((c: any) => {
          regionMapCache.regionMap.set(c.iso_2 ?? "", region)
        })
      })

      regionMapCache.regionMapUpdated = Date.now()
    } else {
      // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
      const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY!,
        },
        next: {
          revalidate: 3600,
          tags: [`regions-${cacheId}`],
        },
      }).then(async (response) => {
        const json = await response.json()

        if (!response.ok) {
          throw new Error(json.message)
        }

        return json
      })

      if (!regions?.length) {
        throw new Error(
          "No regions found. Please set up regions in your Medusa Admin."
        )
      }

      // Create a map of country codes to regions.
      regions.forEach((region: HttpTypes.StoreRegion) => {
        region.countries?.forEach((c) => {
          regionMapCache.regionMap.set(c.iso_2 ?? "", region)
        })
      })

      regionMapCache.regionMapUpdated = Date.now()
    }
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable?"
      )
    }
  }
}

import { NextRequest, NextResponse } from "next/server"

/**
 * Simplified middleware for development - avoids Edge Runtime issues
 */
export async function middleware(request: NextRequest) {
  // For development, just pass through all requests
  // This avoids Edge Runtime compatibility issues
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}

/**
 * Middleware to handle region selection, cache id, UTM params, and A/B experiments.
 */
export async function middleware(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const cartId = searchParams.get("cartId") || searchParams.get("cart_id")
  const checkoutStep = searchParams.get("step")
  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cartIdCookie = request.cookies.get("_medusa_cart_id")

  let redirectUrl = request.nextUrl.href

  let response = NextResponse.redirect(redirectUrl, 307)

  // ==========================================
  // UTM Parameter Preservation
  // ==========================================
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
  const capturedUtms: Record<string, string> = {}

  utmParams.forEach(param => {
    const value = searchParams.get(param)
    if (value) {
      capturedUtms[param] = value
    }
  })

  // Store UTM params in cookie for 7 days if present
  if (Object.keys(capturedUtms).length > 0) {
    const utmData = JSON.stringify(capturedUtms)
    response.cookies.set('_ysh_utm', utmData, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
    })
  }

  // ==========================================
  // A/B Experiment Bucket (50/50 split)
  // ==========================================
  const expBucketCookie = request.cookies.get('_ysh_exp_bucket')
  if (!expBucketCookie) {
    const bucket = Math.random() < 0.5 ? 'A' : 'B'
    response.cookies.set('_ysh_exp_bucket', bucket, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
    })
  }

  // Set a cache id to invalidate the cache for this instance only
  const cacheId = await setCacheId(request, response)

  const regionMap = await getRegionMap(cacheId)

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  // ==========================================
  // Route Consolidation Redirects
  // ==========================================
  const { pathname } = request.nextUrl

  // Redirect legacy /catalogo → /categories (301 permanent)
  if (pathname.match(/^\/[a-z]{2}\/catalogo/)) {
    const newPath = pathname.replace('/catalogo', '/categories')
    return NextResponse.redirect(
      new URL(newPath + request.nextUrl.search, request.url),
      { status: 301 }
    )
  }

  // Redirect legacy /store → /categories (301 permanent)
  if (pathname.match(/^\/[a-z]{2}\/store$/)) {
    const newPath = pathname.replace('/store', '/categories')
    return NextResponse.redirect(
      new URL(newPath + request.nextUrl.search, request.url),
      { status: 301 }
    )
  }

  // Redirect pt-BR /produtos → /categories (308 temporary for SEO transition)
  if (pathname.match(/^\/[a-z]{2}\/produtos$/)) {
    const newPath = pathname.replace('/produtos', '/categories')
    return NextResponse.redirect(
      new URL(newPath + request.nextUrl.search, request.url),
      { status: 308 }
    )
  }

  // Redirect /produtos/[category] → /categories/[category] (308)
  if (pathname.match(/^\/[a-z]{2}\/produtos\/([^/]+)$/)) {
    const newPath = pathname.replace('/produtos/', '/categories/')
    return NextResponse.redirect(
      new URL(newPath + request.nextUrl.search, request.url),
      { status: 308 }
    )
  }

  // check if one of the country codes is in the url
  if (urlHasCountryCode && (!cartId || cartIdCookie) && cacheIdCookie) {
    return NextResponse.next()
  }

  // check if the url is a static asset
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  }

  // If a cart id is in the params, set cookie and redirect to the first step
  if (cartId && !checkoutStep) {
    const url = new URL(redirectUrl)
    url.searchParams.set("step", "shipping-address")
    redirectUrl = url.toString()
    response = NextResponse.redirect(`${redirectUrl}`, 307)
    response.cookies.set("_medusa_cart_id", cartId, { maxAge: 60 * 60 * 24 })
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
