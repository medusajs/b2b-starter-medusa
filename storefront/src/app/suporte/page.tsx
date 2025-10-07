import { listRegions } from "@/lib/data/regions"
import { redirect } from "next/navigation"

export default async function SuporteRoot() {
  const envDefault = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY?.toLowerCase()
  try {
    const regions = await listRegions()
    const all = (regions || [])
      .map((r) => r.countries?.map((c) => c.iso_2?.toLowerCase()))
      .flat()
      .filter(Boolean) as string[]
    const cc = (envDefault && all.includes(envDefault) && envDefault) || (all.includes("br") ? "br" : all[0]) || "br"
    redirect(`/${cc}/suporte`)
  } catch {
    redirect(`/${envDefault || "br"}/suporte`)
  }
}

