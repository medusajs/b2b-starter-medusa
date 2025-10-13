type PvwattsParams = {
  api_key?: string
  system_capacity: number // kWdc
  module_type?: 0 | 1 | 2
  losses?: number // percent
  array_type?: 0 | 1 | 2 | 3 | 4
  tilt: number
  azimuth: number
  lat: number
  lon: number
  dc_ac_ratio?: number
  gcr?: number
  inv_eff?: number
  dataset?: "nsrdb" | "tmy2" | "tmy3"
}

export async function pvwattsV8(params: PvwattsParams): Promise<any> {
  const api_key = params.api_key || process.env.NREL_API_KEY || "DEMO_KEY"
  const base = "https://developer.nrel.gov/api/pvwatts/v8.json"
  const q = new URLSearchParams({
    api_key,
    system_capacity: String(params.system_capacity),
    losses: String(params.losses ?? 14),
    array_type: String(params.array_type ?? 1),
    module_type: String(params.module_type ?? 0),
    tilt: String(params.tilt),
    azimuth: String(params.azimuth),
    lat: String(params.lat),
    lon: String(params.lon),
    dc_ac_ratio: String(params.dc_ac_ratio ?? 1.1),
    gcr: String(params.gcr ?? 0.4),
    inv_eff: String(params.inv_eff ?? 96),
    dataset: params.dataset ?? "nsrdb",
  } as any)
  const url = `${base}?${q.toString()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`PVWatts failed: ${res.status}`)
  return res.json()
}

export function nsrdbTmyDownloadInfo(lat: number, lon: number) {
  const api_key = process.env.NSRDB_API_KEY || ""
  const email = process.env.NSRDB_EMAIL || ""
  return {
    needsAuth: !api_key || !email,
    urlExample: `https://developer.nrel.gov/api/nsrdb/v2/solar/psm3-tmy-download.csv?api_key=YOUR_KEY&email=YOUR_EMAIL&wkt=POINT(${lon}%20${lat})&names=tmy-2020&interval=60` ,
  }
}

