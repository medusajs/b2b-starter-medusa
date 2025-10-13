import { getBaseURL } from "@/lib/util/env"
import type { MetadataRoute } from 'next'

export default async function sitemap() {
  const host = getBaseURL()
  
  const staticRoutes = [
    { path: '', priority: 1.0, changefreq: 'daily' as const },
    { path: '/br/store', priority: 0.9, changefreq: 'daily' as const },
    { path: '/br/categories', priority: 0.9, changefreq: 'daily' as const },
    { path: '/br/solucoes', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/br/dimensionamento', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/br/search', priority: 0.7, changefreq: 'weekly' as const },
  ]
  
  return staticRoutes.map((route) => ({
    url: `${host}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changefreq,
    priority: route.priority,
  }))
}

