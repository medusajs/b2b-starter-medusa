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
