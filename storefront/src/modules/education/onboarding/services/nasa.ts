type NasaTemporal = "hourly" | "daily" | "monthly"

export function buildNasaPowerUrl(params: {
  lat: number
  lon: number
  start: string
  end: string
  temporal: NasaTemporal
  parameters: string[]
}): string {
  const { lat, lon, start, end, temporal, parameters } = params
  const base = "https://power.larc.nasa.gov/api/temporal"
  const plist = encodeURIComponent(parameters.join(","))
  return `${base}/${temporal}/point?parameters=${plist}&community=RE&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`
}

export async function fetchNasaPower(
  cfg: Parameters<typeof buildNasaPowerUrl>[0]
): Promise<any> {
  const url = buildNasaPowerUrl(cfg)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`NASA POWER failed: ${res.status}`)
  return res.json()
}

