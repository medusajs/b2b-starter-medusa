import { getBaseURL } from "@/lib/util/env"

export default function robots() {
  const host = getBaseURL()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/account/', '/checkout/', '/_next/', '/admin/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/account/', '/checkout/', '/admin/'],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  }
}

