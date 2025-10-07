import { getBaseURL } from "@/lib/util/env"

export default function robots() {
  const host = getBaseURL()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  }
}

