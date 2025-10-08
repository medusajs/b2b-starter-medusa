"use server"

import { sdk } from "@/lib/config"
import medusaError from "@/lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"
import { FALLBACK_REGIONS, logFallback } from "./fallbacks"

export const listRegions = async (): Promise<HttpTypes.StoreRegion[]> => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  try {
    return await sdk.client
      .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
        method: "GET",
        next,
        cache: "force-cache",
      })
      .then(({ regions }: { regions: HttpTypes.StoreRegion[] }) => regions)
  } catch (error) {
    logFallback("regions", error instanceof Error ? error.message : "Unknown error")
    return FALLBACK_REGIONS as HttpTypes.StoreRegion[]
  }
}

export const retrieveRegion = async (
  id: string
): Promise<HttpTypes.StoreRegion> => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ region }: { region: HttpTypes.StoreRegion }) => region)
    .catch(medusaError)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (
  countryCode: string
): Promise<HttpTypes.StoreRegion | null> => {
  try {
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode) ?? null
    }

    const regions = await listRegions()

    if (!regions) {
      return null
    }

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(c?.iso_2 ?? "", region)
      })
    })

    const region = countryCode
      ? regionMap.get(countryCode)
      : regionMap.get("us")

    return region ?? null
  } catch (e: any) {
    return null
  }
}
