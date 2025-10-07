import { getBaseURL } from "@/lib/util/env"

export default async function sitemap() {
  const host = getBaseURL()
  const routes = ["", "/produtos", "/produtos/kits", "/search"]
  return routes.map((r) => ({ url: `${host}${r}`, changefreq: "daily" as const, priority: r === "" ? 1 : 0.7 }))
}

