"use client"

import { useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Container, Heading, Text } from "@medusajs/ui"

export default function PrintableProposalPage() {
  const search = useSearchParams()

  const data = useMemo(() => {
    try {
      const raw = search?.get("data")
      if (!raw) return null
      return JSON.parse(decodeURIComponent(raw))
    } catch {
      return null
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(() => {
      try { window.print?.() } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [])

  const fmt = (v: number | undefined, digits = 0) =>
    typeof v === "number" && isFinite(v) ? v.toFixed(digits) : "-"

  return (
    <div className="min-h-screen bg-neutral-50 p-6 print:p-0">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .page { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-4xl page bg-white rounded-2xl border border-neutral-200 shadow-sm print:shadow-none print:rounded-none">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <Heading level="h1" className="text-xl">Proposta Técnica — Yello Solar Hub</Heading>
            <Text className="txt-compact-xsmall text-neutral-600">Documento gerado automaticamente a partir do dimensionamento</Text>
          </div>
          <div className="no-print">
            <button onClick={() => window.print()} className="px-4 py-2 rounded-lg border text-neutral-700 hover:bg-neutral-50">Imprimir</button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Container className="rounded-xl p-4">
            <Heading level="h2" className="text-base mb-2">Resumo do Sistema</Heading>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full border bg-amber-50 text-amber-700">{fmt(data?.system_kwp, 2)} kWp</span>
              <span className="px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700">{fmt(data?.expected_generation_kwh_year)} kWh/ano</span>
              {typeof data?.performance_ratio === 'number' && (
                <span className="px-3 py-1 rounded-full border bg-blue-50 text-blue-700">PR {(data.performance_ratio * 100).toFixed(0)}%</span>
              )}
              {typeof data?.oversizing_ratio === 'number' && data.oversizing_ratio > 1 && (
                <span className="px-3 py-1 rounded-full border bg-indigo-50 text-indigo-700">Oversizing {((data.oversizing_ratio - 1) * 100).toFixed(0)}%</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <div className="text-neutral-500">Inversor</div>
                <div className="font-semibold">{fmt(data?.inverter_kw, 1)} kW</div>
              </div>
              <div>
                <div className="text-neutral-500">Módulos</div>
                <div className="font-semibold">{data?.panels_count ?? '-'}</div>
              </div>
              <div>
                <div className="text-neutral-500">Área</div>
                <div className="font-semibold">{fmt(data?.area_m2, 0)} m²</div>
              </div>
            </div>
          </Container>

          <Container className="rounded-xl p-4">
            <Heading level="h2" className="text-base mb-2">Local e Tarifa</Heading>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-neutral-500">Estado</div>
                <div className="font-semibold">{data?.location?.estado ?? '-'}</div>
              </div>
              <div>
                <div className="text-neutral-500">HSP</div>
                <div className="font-semibold">{fmt(data?.location?.hsp, 2)} kWh/m²/dia</div>
              </div>
              <div>
                <div className="text-neutral-500">Tarifa</div>
                <div className="font-semibold">R$ {fmt(data?.location?.tarifa_kwh, 2)}/kWh</div>
              </div>
            </div>
          </Container>

          <Container className="rounded-xl p-4 md:col-span-2">
            <Heading level="h2" className="text-base mb-2">Análise Financeira</Heading>
            {data?.finance ? (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-neutral-500">CAPEX</div>
                  <div className="font-semibold">R$ {fmt(data.finance.capex_total_brl, 0)}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Economia mensal</div>
                  <div className="font-semibold">R$ {fmt(data.finance.economy_month_brl, 0)}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Payback</div>
                  <div className="font-semibold">{fmt(data.finance.payback_anos, 1)} anos</div>
                </div>
              </div>
            ) : (
              <Text className="txt-compact-small text-neutral-600">Sem dados financeiros fornecidos.</Text>
            )}
          </Container>

          <Container className="rounded-xl p-4 md:col-span-2">
            <Heading level="h2" className="text-base mb-2">Notas e Disclaimers</Heading>
            <ul className="list-disc pl-5 space-y-1 text-[13px] text-neutral-700">
              <li>Estimativas sujeitas a homologação da distribuidora e variações de clima/consumo.</li>
              <li>A verificação cruzada utiliza PVWatts/NSRDB quando disponível.</li>
              <li>Dados climáticos públicos (NASA POWER/NSRDB) — sem uso de informações pessoais.</li>
            </ul>
          </Container>
        </div>
      </div>
    </div>
  )
}

