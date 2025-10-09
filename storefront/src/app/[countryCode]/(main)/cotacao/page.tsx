"use client"

import Image from "next/image"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { useLeadQuote } from "@/modules/lead-quote/context"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "@medusajs/ui"

export default function CotacaoPage() {
  const { items, remove, clear, add } = useLeadQuote()
  const search = useSearchParams()
  const total = useMemo(() => items.length, [items])
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", consent: false })

  // Prefill from query (?data=...)
  useEffect(() => {
    try {
      const dataParam = search?.get('data')
      if (!dataParam) return
      const data = JSON.parse(decodeURIComponent(dataParam))
      const id = `viability-${Date.now()}`
      const kwp = data.system_kwp || data.kwp_proposto
      const gen = data.expected_generation_kwh_year || (data.expected_generation_mwh && data.expected_generation_mwh * 1000)
      const pr = data.performance_ratio
      const name = `Sistema ${kwp?.toFixed ? kwp.toFixed(2) : kwp} kWp • ${Math.round(gen || 0)} kWh/ano • PR ${(pr * 100).toFixed ? (pr * 100).toFixed(0) : pr}%`
      add({ id, name, category: 'system', manufacturer: 'YSH Viabilidade' })
      const parts = [
        `Estado: ${data?.location?.estado || '-'}`,
        `HSP: ${data?.location?.hsp || '-'}`,
        `Tarifa (R$/kWh): ${data?.location?.tarifa_kwh ?? '-'}`,
        `Inversor (kW): ${data?.inverter_kw ?? '-'}`,
        `Módulos (un): ${data?.panels_count ?? '-'}`,
        `Área (m²): ${data?.area_m2 ?? '-'}`,
        data?.finance ? `CAPEX: R$ ${data.finance.capex_total_brl} • Economia/mês: R$ ${data.finance.economy_month_brl} • Payback: ${data.finance.payback_anos} anos` : undefined,
      ].filter(Boolean) as string[]
      setForm((f) => ({ ...f, message: `Detalhes do sistema recomendado:\n- ${parts.join('\n- ')}` }))
    } catch { }
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="content-container py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-950">Lista de Cotação</h1>
          <p className="text-neutral-600">{total} itens</p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-2">
            <button className="ysh-btn-outline" onClick={clear}>Limpar lista</button>
            {(() => {
              const dataParam = search?.get('data')
              if (!dataParam) return null
              return (
                <LocalizedClientLink
                  href={`/proposta/printable?data=${encodeURIComponent(dataParam)}`}
                  className="ysh-btn-secondary"
                >
                  Baixar PDF
                </LocalizedClientLink>
              )
            })()}
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="bg-white p-8 rounded-lg border text-center">
          <p className="text-neutral-700">Sua lista está vazia.</p>
          <div className="mt-4">
            <LocalizedClientLink href="/categories" className="ysh-btn-primary">Explorar produtos</LocalizedClientLink>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((it) => (
            <div key={it.id} className="bg-white rounded-lg border p-3">
              <div className="relative w-full aspect-square bg-neutral-100 rounded-md overflow-hidden">
                {it.image_url && (
                  <Image src={it.image_url} alt={it.name} fill className="object-cover" />
                )}
              </div>
              <div className="mt-2">
                <div className="text-sm text-neutral-500">{it.manufacturer}</div>
                <div className="font-medium text-neutral-900 line-clamp-2">{it.name}</div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <LocalizedClientLink href={`/produtos/${(it as any).category || 'panels'}/${it.id}`} className="ysh-btn-outline text-sm">Ver</LocalizedClientLink>
                <button className="text-xs text-red-600" onClick={() => remove(it.id)}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 0 && (
        <div className="mt-8 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h2 className="text-lg font-medium mb-3">Solicitar cotação</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className="border rounded-md h-9 px-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="border rounded-md h-9 px-2" placeholder="E-mail*" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="border rounded-md h-9 px-2" placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <textarea className="border rounded-md p-2 md:col-span-3" placeholder="Mensagem" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <label className="md:col-span-3 flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
                Autorizo o contato para fins comerciais e concordo com a Política de Privacidade.
              </label>
            </div>
            <div className="flex gap-3 mt-3">
              <button
                className="ysh-btn-primary"
                onClick={async () => {
                  if (!form.email) {
                    toast.error("Informe um e-mail válido")
                    return
                  }
                  if (!form.consent) {
                    toast.error("É necessário aceitar o contato para prosseguir")
                    return
                  }
                  setSubmitting(true)
                  try {
                    const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL as string
                    const res = await fetch(`${backend}/store/leads`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ...form, items }),
                    })
                    if (!res.ok) throw new Error("Falha ao enviar")
                    const json = await res.json()
                    toast.success("Cotação enviada! Código: " + json.id)
                  } catch (e: any) {
                    toast.error(e.message || "Erro ao enviar")
                  } finally {
                    setSubmitting(false)
                  }
                }}
                disabled={submitting}
              >
                {submitting ? "Enviando..." : "Enviar cotação"}
              </button>
              <a
                className="ysh-btn-secondary"
                href={(() => {
                  const lines = items.map((i) => `- ${i.name} (${i.manufacturer || ''}) [${(i as any).category}/${i.id}]`).join('\n')
                  const body = `Gostaria de solicitar uma cotação dos seguintes itens:\n${lines}`
                  return `mailto:contato@yellosolarhub.com?subject=Solicitação%20de%20Cotação&body=${encodeURIComponent(body)}`
                })()}
              >
                Solicitar por e-mail
              </a>
              <a
                className="ysh-btn-outline"
                href={(() => {
                  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER as string) || '5521979209021'
                  const lines = items.map((i) => `- ${i.name} (${i.manufacturer || ''}) [${(i as any).category}/${i.id}]`).join('%0A')
                  const text = `Gostaria de solicitar uma cotação:%0A${lines}`
                  return `https://wa.me/${number}?text=${text}`
                })()}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              <button
                className="ysh-btn-outline"
                onClick={() => {
                  const data = JSON.stringify({ items }, null, 2)
                  navigator.clipboard.writeText(data)
                  toast.success("Itens copiados para a área de transferência")
                }}
              >
                Copiar itens (JSON)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
