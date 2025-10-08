"use client"

import { useState } from "react"
import Link from "next/link"
import { Container, Heading, Text } from "@medusajs/ui"
import Button from "@/modules/common/components/button"
import ChecklistOnboarding from "./ChecklistOnboarding"
import { sendEvent } from "@/modules/analytics/events"
import { t } from "@/lib/i18n/copy"
import dynamic from "next/dynamic"
const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false })

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
  const [cep, setCep] = useState<string>("")
  const [lat, setLat] = useState<string>("")
  const [lon, setLon] = useState<string>("")
  const [monthly, setMonthly] = useState<string>("")
  const [tilt, setTilt] = useState<string>("")
  const [azimuth, setAzimuth] = useState<string>("0")
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
        tilt_deg: tilt ? Number(tilt) : Math.max(0, Math.min(90, Math.abs(Number(lat) || 0))),
        azimuth_deg: azimuth ? Number(azimuth) : 0,
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
      sendEvent?.("viability_calculated", { proposal_kwp: j.kWp, expected_gen_mwh_y: Math.round((j.kWh_year || 0) / 1000 * 10) / 10 })
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
            <input className="col-span-1 border border-[var(--border)] rounded-md px-3 py-2 bg-transparent" placeholder="CEP (01311-000)" value={cep} onChange={(e) => setCep(e.target.value)} />
            <Button variant="secondary" className="rounded-full" onClick={geocode}>Usar CEP</Button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input className="border border-[var(--border)] rounded-md px-3 py-2 bg-transparent" placeholder="Latitude (-23.55)" value={lat} onChange={(e) => setLat(e.target.value)} />
            <input className="border border-[var(--border)] rounded-md px-3 py-2 bg-transparent" placeholder="Longitude (-46.63)" value={lon} onChange={(e) => setLon(e.target.value)} />
          </div>
          <MapPicker
            lat={Number(lat) || -23.55}
            lon={Number(lon) || -46.63}
            onChange={(p) => {
              setLat(String(p.lat))
              setLon(String(p.lon))
            }}
          />
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input className="border border-[var(--border)] rounded-md px-3 py-2 bg-transparent" placeholder="Consumo (kWh/mês)" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Inclinação (°)</label>
              <input className="border border-[var(--border)] rounded-md px-3 py-2 bg-transparent" placeholder={`Sugerido: ${Math.max(0, Math.min(90, Math.abs(Number(lat) || 0))).toFixed(0)}`} value={tilt} onChange={(e) => setTilt(e.target.value)} />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{t("config.tooltip_inclinacao")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-600 dark:text-zinc-400">Azimute (°)</label>
              <input className="border border-[var(--border)] rounded-md px-3 py-2 bg-transparent" placeholder="0 = Norte; 90 = Leste; -90 = Oeste" value={azimuth} onChange={(e) => setAzimuth(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button className="rounded-full" onClick={simulate} isLoading={loading}>Simular</Button>
            {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
          </div>
          {res && (
            <div className="mt-5 space-y-1">
              <div className="text-sm">• Potência sugerida: <strong>{res.kWp.toFixed(1)} kWp</strong></div>
              <div className="text-sm">• Geração anual: <strong>{Math.round(res.kWh_year / 1000 * 10) / 10} MWh/ano</strong></div>
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
                        tilt_deg: tilt ? Number(tilt) : Math.max(0, Math.min(90, Math.abs(Number(lat) || 0))),
                        azimuth_deg: azimuth ? Number(azimuth) : 0,
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
                  } catch { }
                }}>Gerar proposta detalhada + assinatura digital</Button>
                <button className="contrast-btn" onClick={() => {
                  try {
                    const html = `<!doctype html><html lang=pt-br><head><meta charset=utf-8><title>Proposta Yello</title><meta name=viewport content="width=device-width,initial-scale=1"><style>body{font-family:Inter,system-ui,-apple-system; padding:24px; color:#111} .card{border:1px solid #e5e7eb; border-radius:16px; padding:16px; margin-bottom:12px} h1{font-size:20px;margin:0 0 8px} .row{display:flex;gap:12px;flex-wrap:wrap} .pill{padding:6px 10px;border-radius:999px;background:#fef3c7;border:1px solid #fde68a} .note{font-size:12px;color:#555}</style></head><body><h1>Proposta Yello Solar Hub</h1><div class="card"><div class=row><div class=pill>Potência: ${res.kWp.toFixed(1)} kWp</div><div class=pill>Geração: ${(Math.round(res.kWh_year / 100) / 10).toFixed(1)} MWh/ano</div><div class=pill>Área: ${Math.round(res.area_m2)} m²</div><div class=pill>Tilt: ${tilt || Math.max(0, Math.min(90, Math.abs(Number(lat) || 0))).toFixed(0)}°</div><div class=pill>Azimute: ${azimuth || 0}°</div></div></div><div class=card><strong>Curva mensal (kWh)</strong><div style="height:140px;margin-top:8px">${(() => { const max = Math.max(...res.kWh_month, 1); const bars = res.kWh_month.map(v => `<div style=\"height:120px;width:calc(100%/12 - 6px);display:inline-block;margin-right:6px;vertical-align:bottom\"><div style=\"height:${(v / max) * 120}px;background:#f59e0b;border-radius:6px 6px 0 0\"></div></div>`).join(''); return bars; })()}</div></div><div class=note>* Estimativas baseadas em dados públicos (PVGIS/PVWatts) e podem variar com sombreamento e uso. Lei 14.300 aplicada.</div><script>window.print&&setTimeout(()=>window.print(),400)</script></body></html>`
                    const blob = new Blob([html], { type: 'text/html' })
                    const url = URL.createObjectURL(blob)
                    window.open(url, '_blank')
                  } catch { }
                }}>Visualizar/Salvar PDF</button>
                <Link className="contrast-btn" href="/suporte">Falar com especialista</Link>
              </div>
              {Array.isArray(res.kWh_month) && res.kWh_month.length === 12 && (
                <div className="mt-4">
                  <svg width="100%" viewBox="0 0 600 180" preserveAspectRatio="xMidYMid meet">
                    {(() => {
                      const w = 560, h = 120, x0 = 20, y0 = 150
                      const max = Math.max(...res.kWh_month, 1)
                      const bw = w / 12 - 6
                      return res.kWh_month.map((v, i) => {
                        const bh = (v / max) * h
                        const x = x0 + i * (bw + 6)
                        const y = y0 - bh
                        return (
                          <g key={i}>
                            <rect x={x} y={y} width={bw} height={bh} fill="#f59e0b" opacity={0.8} rx={4} />
                          </g>
                        )
                      })
                    })()}
                  </svg>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Curva mensal estimada (kWh)</div>
                </div>
              )}
            </div>
          )}
        </Container>
        <ChecklistOnboarding onComplete={() => { /* noop for now */ }} />
      </div>
    </div>
  )
}
