import { pvwattsV8 } from "../services/nrel"
import { fetchAneelTariff } from "../services/aneel"
import type { SimulationInput, SimulationResult, ClimateSource } from "./contracts"

// Futuro: integrar microserviço pvlib em Python
async function simulatePvlibService(input: SimulationInput): Promise<{ kwh_month?: number[]; kwh_year?: number; details?: any } | null> {
  const url = process.env.PVLIB_SERVICE_URL
  if (!url) return null
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: input.lat,
        lon: input.lon,
        tilt_deg: input.tilt_deg,
        azimuth_deg: input.azimuth_deg,
        losses_pct: input.losses_pct ?? 16,
      }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function runOnboardingSimulation(input: SimulationInput): Promise<SimulationResult> {
  const losses = input.losses_pct ?? 16
  // Heurística inicial do tamanho do sistema
  // Se consumo mensal disponível, usar fator 1 kWp ~ 120 kWh/mês (ajustável por região)
  let kWp = input.system_kwp_hint ?? 0
  if (!kWp && input.monthly_kwh) {
    kWp = Math.max(0.5, input.monthly_kwh / 120)
  }
  if (!kWp) kWp = 3

  // 1) pvlib microservice (se disponível)
  let climateSource: ClimateSource = "NASA_POWER"
  let pvlibOut = await simulatePvlibService(input)

  // 2) PVWatts v8 (NREL) como auditoria/base
  const pvw = await pvwattsV8({
    system_capacity: kWp,
    lat: input.lat,
    lon: input.lon,
    tilt: input.tilt_deg,
    azimuth: input.azimuth_deg,
    losses,
  })

  const pvw_kwh_year: number = pvw?.outputs?.ac_annual ?? 0
  const pvw_kwh_month: number[] = pvw?.outputs?.ac_monthly ?? []

  // Preferir pvlib se disponível; senão, PVWatts
  const kWh_year = pvlibOut?.kwh_year ?? pvw_kwh_year
  const kWh_month = pvlibOut?.kwh_month ?? pvw_kwh_month

  let diffPct: number | undefined
  if (pvlibOut?.kwh_year) {
    if (pvw_kwh_year > 0) {
      diffPct = Math.abs((pvlibOut.kwh_year - pvw_kwh_year) / pvw_kwh_year) * 100
    }
  }

  // 3) Tarifa ANEEL (placeholder busca)
  const tariff = await fetchAneelTariff(input.distributor_name || "", input.tariff_class || "B1")
  const te = tariff.te ?? 0
  const tusd = tariff.tusd ?? 0
  const r_per_kwh = te + tusd

  // 4) Economia simples (bruta)
  const economy_month_brl = kWh_month?.[0] ? kWh_month.reduce((a, b) => a + b, 0) / 12 * r_per_kwh : undefined

  // 5) Kit proposto (estimativa)
  const moduleWp = 550
  const modules = Math.max(1, Math.round((kWp * 1000) / moduleWp))
  const inverters = Math.max(1, Math.round(kWp / 5))
  const area_m2 = modules * 2.2 // estimativa ~2.2 m² por módulo

  const alerts: string[] = []
  if (typeof diffPct === "number" && diffPct > 8) {
    alerts.push("Diferença > 8% entre pvlib e PVWatts – revisar sombreamento/entradas")
  }

  return {
    kWp,
    modules,
    inverters,
    kWh_month: kWh_month || new Array(12).fill(0),
    kWh_year,
    losses_pct: losses,
    area_m2,
    economy_month_brl,
    sources: {
      climate: climateSource,
      pv_model: pvlibOut ? "pvlib+PVWatts" : "PVWatts",
      pvwatts_diff_pct: diffPct,
      tariff_source: tariff.source_url,
    },
    alerts,
    assumptions: {
      module_wp: moduleWp,
      dc_ac_ratio: 1.1,
      gcr: 0.4,
    },
  }
}

