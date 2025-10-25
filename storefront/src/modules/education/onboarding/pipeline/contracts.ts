export type ClimateSource = "NASA_POWER" | "NSRDB_TMY"

export type SimulationInput = {
  lat: number
  lon: number
  monthly_kwh?: number
  bills_last_12m_kwh?: number[]
  tilt_deg: number
  azimuth_deg: number
  losses_pct?: number
  system_kwp_hint?: number
  tariff_class?: string
  distributor_name?: string
}

export type SimulationResult = {
  kWp: number
  modules: number
  inverters: number
  kWh_month: number[]
  kWh_year: number
  losses_pct: number
  area_m2: number
  economy_month_brl?: number
  economy_pct?: number
  payback_years?: number
  roi_annual_pct?: number
  sources: {
    climate: ClimateSource
    pv_model: string
    pvwatts_diff_pct?: number
    tariff_source?: string
  }
  alerts: string[]
  assumptions: Record<string, any>
}

