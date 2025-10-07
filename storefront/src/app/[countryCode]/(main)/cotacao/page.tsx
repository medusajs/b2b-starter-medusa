"use client"

import Image from "next/image"
import Link from "next/link"
import { useLeadQuote } from "@/modules/lead-quote/context"
import { useMemo, useState } from "react"
import { toast } from "@medusajs/ui"

export default function CotacaoPage() {
  const { items, remove, clear } = useLeadQuote()
  const total = useMemo(() => items.length, [items])
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", consent: false })

  return (
    <div className="content-container py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-950">Lista de Cotação</h1>
          <p className="text-neutral-600">{total} itens</p>
        </div>
        {total > 0 && (
          <button className="ysh-btn-outline" onClick={clear}>Limpar lista</button>
        )}
      </div>

      {total === 0 ? (
        <div className="bg-white p-8 rounded-lg border text-center">
          <p className="text-neutral-700">Sua lista está vazia.</p>
          <div className="mt-4">
            <Link href="/produtos" className="ysh-btn-primary">Explorar produtos</Link>
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
                <Link href={`/produtos/${(it as any).category || 'panels'}/${it.id}`} className="ysh-btn-outline text-sm">Ver</Link>
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
                  const lines = items.map((i) => `- ${i.name} (${i.manufacturer || ''}) [${(i as any).category}/${i.id}]`).join('%0A')
                  const text = `Gostaria de solicitar uma cotação:%0A${lines}`
                  return `https://wa.me/5599999999999?text=${text}`
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
