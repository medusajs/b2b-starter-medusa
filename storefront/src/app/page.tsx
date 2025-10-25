import { listRegions } from "@/lib/data/regions"
import { redirect } from "next/navigation"

export const dynamic = "force-static"

export default async function Landing() {
  // Preferred default via env, otherwise BR if available, else first region country
  const envDefault = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY?.toLowerCase()
  try {
    const regions = await listRegions()
    const allCountries = (regions || [])
      .map((r) => r.countries?.map((c) => c.iso_2?.toLowerCase()))
      .flat()
      .filter(Boolean) as string[]

    const country =
      (envDefault && allCountries.includes(envDefault) && envDefault) ||
      (allCountries.includes("br") ? "br" : allCountries[0]) ||
      "br"

    redirect(`/${country}`)
  } catch {
    redirect(`/${envDefault || "br"}`)
  }
}

