import { NextResponse } from "next/server"
import { runOnboardingSimulation } from "@/modules/onboarding/pipeline"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { lat, lon, monthly_kwh, tilt_deg, azimuth_deg, losses_pct, tariff_class, distributor_name, system_kwp_hint } = body || {}

    if (typeof lat !== "number" || typeof lon !== "number") {
      return NextResponse.json({ error: "Parâmetros obrigatórios ausentes: lat/lon" }, { status: 400 })
    }

    const result = await runOnboardingSimulation({
      lat,
      lon,
      monthly_kwh: typeof monthly_kwh === "number" ? monthly_kwh : undefined,
      tilt_deg: typeof tilt_deg === "number" ? tilt_deg : Math.max(0, Math.min(90, Math.abs(lat))),
      azimuth_deg: typeof azimuth_deg === "number" ? azimuth_deg : 0,
      losses_pct: typeof losses_pct === "number" ? losses_pct : undefined,
      system_kwp_hint: typeof system_kwp_hint === "number" ? system_kwp_hint : undefined,
      tariff_class: typeof tariff_class === "string" ? tariff_class : undefined,
      distributor_name: typeof distributor_name === "string" ? distributor_name : undefined,
    })

    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao simular" }, { status: 500 })
  }
}

