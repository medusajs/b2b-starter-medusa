"use client"

import { useState } from "react"
import { Container, Heading, Text } from "@medusajs/ui"
import Button from "@/modules/common/components/button"
import ChecklistOnboarding from "./ChecklistOnboarding"
import { sendEvent } from "@/modules/analytics/events"
import { t } from "@/lib/i18n/copy"

type SimResult = {
  kWp: number
  kWh_year: number
  kWh_month: number[]
  economy_month_brl?: number
  area_m2: number
  sources?: any
  alerts?: string[]
}

export default function DimensionamentoClient() {
  const [cep, setCep] = useState<string]("")
  const [lat, setLat] = useState<string>("")
  const [lon, setLon] = useState<string>("")
  const [monthly, setMonthly] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [res, setRes] = useState<SimResult | null>(null)

  const simulate = async () => {
    setLoading(true)
    setError(null)
    setRes(null)
    try {
      const body = {
        lat: Number(lat),
        lon: Number(lon),
        monthly_kwh: monthly ? Number(monthly) : undefined,
      }
      if (!isFinite(body.lat) || !isFinite(body.lon)) {
        setError(t("form.errors.required"))
        setLoading(false)
        return
      }
      const r = await fetch("/api/onboarding/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || "Falha na simulação")
      setRes(j)
      sendEvent?.("viability_calculated", { proposal_kwp: j.kWp, expected_gen_mwh_y: Math.round((j.kWh_year||0)/1000*10)/10 })
    } catch (e: any) {
      setError(e?.message || t("form.errors.range"))
    } finally {
      setLoading(false)
    }
  }

  const geocode = async () => {
    setError(null)
    try {
      if (!cep) {
        setError(t("form.errors.cep"))
        return
      }
      const r = await fetch("/api/onboarding/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || "Falha ao geocodificar")
      setLat(String(j.lat))
      setLon(String(j.lon))
    } catch (e: any) {
      setError(e?.message || t("form.errors.cep"))
    }
  }

  return (
    <div className="content-container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Container className="rounded-2xl p-6 bg-[var(--surface)]/80 border border-[var(--border)] backdrop-blur-sm shadow-lg">
          <Heading level="h2" className="text-lg mb-2">Dimensionamento rápido</Heading>
          <Text className="txt-compact-small mb-4">Use lat/lon (ponto no mapa) e consumo médio para estimar seu sistema.</Text>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input className="col-span-1 border border-[var(--border)] rounded-md px-3 py-2 bg-transparent" placeholder="CEP (01311-000)" value={cep} onChange={(e)=>setCep(e.target.value)} />
            <Button variant="secondary" className="rounded-full" onClick={geocode}>Usar CEP</Button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input className="border border-[var(--border)] rounded-md px-3 py-2 bg-transparent" placeholder="Latitude (-23.55)" value={lat} onChange={(e)=>setLat(e.target.value)} />
            <input className="border border-[var(--border)] rounded-md px-3 py-2 bg-transparent" placeholder="Longitude (-46.63)" value={lon} onChange={(e)=>setLon(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input className="border border-[var(--border)] rounded-md px-3 py-2 bg-transparent" placeholder="Consumo (kWh/mês)" value={monthly} onChange={(e)=>setMonthly(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Button className="rounded-full" onClick={simulate} isLoading={loading}>Simular</Button>
            {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
          </div>
          {res && (
            <div className="mt-5 space-y-1">
              <div className="text-sm">• Potência sugerida: <strong>{res.kWp.toFixed(1)} kWp</strong></div>
              <div className="text-sm">• Geração anual: <strong>{Math.round(res.kWh_year/1000*10)/10} MWh/ano</strong></div>
              {typeof res.economy_month_brl === "number" && (
                <div className="text-sm">• Economia estimada/mês: <strong>R$ {res.economy_month_brl.toFixed(2)}</strong></div>
              )}
              <div className="text-sm">• Área estimada: <strong>{Math.round(res.area_m2)} m²</strong></div>
              {res.alerts?.length ? (
                <div className="text-xs text-amber-600 mt-2">{res.alerts[0]}</div>
              ) : null}
              <div className="flex gap-3 pt-3">
                <Button className="rounded-full" onClick={() => {
                  try {
                    const payload = {
                      summary: {
                        kwp: res.kWp,
                        kwh_year: res.kWh_year,
                        economy_month_brl: res.economy_month_brl,
                        area_m2: res.area_m2,
                      },
                      sources: res.sources,
                      ts: new Date().toISOString(),
                    }
                    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'proposta-yello-draft.json'
                    a.click()
                    URL.revokeObjectURL(url)
                  } catch {}
                }}>Gerar proposta detalhada + assinatura digital</Button>
                <a className="contrast-btn" href="/suporte">Falar com especialista</a>
              </div>
            </div>
          )}
        </Container>
        <ChecklistOnboarding onComplete={() => { /* noop for now */ }} />
      </div>
    </div>
  )
}
