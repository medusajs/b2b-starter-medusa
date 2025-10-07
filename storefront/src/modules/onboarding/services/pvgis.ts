export type PvgisPvcalcParams = {
  lat: number
  lon: number
  peakpower_kw: number // kWdc
  loss_pct?: number // default 14-18
  angle_deg: number // tilt
  aspect_deg: number // azimuth (0 = South in PVGIS)
}

export async function pvgisPVcalc(params: PvgisPvcalcParams): Promise<any> {
  const { lat, lon, peakpower_kw, loss_pct = 16, angle_deg, aspect_deg } = params
  const base = "https://re.jrc.ec.europa.eu/api/PVcalc"
  const q = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    peakpower: String(peakpower_kw),
    loss: String(loss_pct),
    angle: String(angle_deg),
    aspect: String(aspect_deg),
    outputformat: "json",
  })
  const url = `${base}?${q.toString()}`
  const res = await fetch(url, { next: { revalidate: 60 * 60 } })
  if (!res.ok) throw new Error(`PVGIS PVcalc failed: ${res.status}`)
  return res.json()
}

export function parsePvgisMonthly(result: any): { monthly_kwh: number[]; annual_kwh: number } | null {
  try {
    const monthly = result?.outputs?.totals?.monthly
    if (Array.isArray(monthly) && monthly.length >= 12) {
      const kwh = monthly.map((m: any) => Number(m?.E_m) || 0)
      const annual = kwh.reduce((a, b) => a + b, 0)
      return { monthly_kwh: kwh, annual_kwh: annual }
    }
    const annual = Number(result?.outputs?.totals?.fixed?.E_y)
    if (isFinite(annual)) {
      return { monthly_kwh: new Array(12).fill(annual / 12), annual_kwh: annual }
    }
  } catch {}
  return null
}

