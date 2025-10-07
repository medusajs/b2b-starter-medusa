"use client"

import Image from "next/image"
import Link from "next/link"
import { useLeadQuote } from "@/modules/lead-quote/context"
import { useMemo } from "react"

export default function CotacaoPage() {
  const { items, remove, clear } = useLeadQuote()
  const total = useMemo(() => items.length, [items])

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
        <div className="mt-8 flex gap-3">
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
          <button
            className="ysh-btn-primary"
            onClick={() => {
              const data = JSON.stringify({ items }, null, 2)
              navigator.clipboard.writeText(data)
            }}
          >
            Copiar itens (JSON)
          </button>
        </div>
      )}
    </div>
  )
}

