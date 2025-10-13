export type TariffClass = "B1" | "B2" | "B3" | "Rural" | "Outra"

export type BaseInputs = {
  address?: string
  lat?: number
  lon?: number
  monthly_kwh?: number
  bills_last_12m_kwh?: number[]
  tariff_class?: TariffClass
  roof_tilt_deg?: number
  roof_azimuth_deg?: number
  shading_notes?: string
  preference?: "economia" | "investimento_baixo" | "balanceado"
  batteries?: boolean
  expansion_room?: boolean
  distributor_name?: string
}

export type IntentId =
  | "BASE_ONBOARDING"
  | "RESIDENCIAL_B1"
  | "COMERCIAL_B3"
  | "AVANCADO_INTEGRADOR"

export type SlotDef = {
  id: keyof BaseInputs
  required?: boolean
  description: string
}

export type IntentDef = {
  id: IntentId
  title: string
  slots: SlotDef[]
  defaults?: Partial<BaseInputs>
}

export const INTENTS: IntentDef[] = [
  {
    id: "BASE_ONBOARDING",
    title: "Onboarding Autosserviço – Base",
    slots: [
      { id: "address", description: "Endereço ou pin no mapa" },
      { id: "monthly_kwh", description: "Média mensal kWh ou 12 faturas" },
      { id: "tariff_class", description: "Classe tarifária (ex. B1)" },
      { id: "roof_tilt_deg", description: "Inclinação do telhado (°)" },
      { id: "roof_azimuth_deg", description: "Orientação (azimute em °)" },
      { id: "preference", description: "Economia vs investimento" },
      { id: "distributor_name", description: "Distribuidora (se souber)" },
    ],
    defaults: {
      tariff_class: "B1",
      batteries: false,
      expansion_room: false,
      preference: "balanceado",
    },
  },
  {
    id: "RESIDENCIAL_B1",
    title: "Residencial (B1)",
    slots: [
      { id: "address", required: true, description: "Endereço/CEP ou pin" },
      { id: "monthly_kwh", description: "kWh/mês médio" },
      { id: "bills_last_12m_kwh", description: "Últimos 12 meses (kWh)" },
      { id: "roof_tilt_deg", description: "Inclinação do telhado (°)" },
      { id: "roof_azimuth_deg", description: "Orientação (azimute em °)" },
      { id: "preference", description: "Objetivo (economia/investimento)" },
    ],
    defaults: { tariff_class: "B1" },
  },
  {
    id: "COMERCIAL_B3",
    title: "Comercial/PME (B3)",
    slots: [
      { id: "address", required: true, description: "Endereço/CEP ou pin" },
      { id: "bills_last_12m_kwh", description: "Últimos 12 meses (kWh)" },
      { id: "monthly_kwh", description: "kWh/mês (se não tiver 12m)" },
      { id: "roof_tilt_deg", description: "Inclinação (°)" },
      { id: "roof_azimuth_deg", description: "Azimute (°)" },
      { id: "preference", description: "Economia vs payback" },
    ],
    defaults: { tariff_class: "B3" },
  },
  {
    id: "AVANCADO_INTEGRADOR",
    title: "Avançado / Integrador",
    slots: [
      { id: "address", description: "Endereço/lat-lon" },
      { id: "monthly_kwh", description: "kWh/mês" },
      { id: "bills_last_12m_kwh", description: "12 meses (kWh)" },
      { id: "tariff_class", description: "Classe tarifária" },
      { id: "distributor_name", description: "Distribuidora" },
      { id: "roof_tilt_deg", description: "Inclinação (°)" },
      { id: "roof_azimuth_deg", description: "Azimute (°)" },
      { id: "shading_notes", description: "Sombreamento/obstruções" },
    ],
  },
]

export function getIntent(id: IntentId): IntentDef | undefined {
  return INTENTS.find((i) => i.id === id)
}

export function applyDefaults(inputs: BaseInputs, intent: IntentDef): BaseInputs {
  return { ...intent.defaults, ...inputs }
}

