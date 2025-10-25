import { NextResponse } from "next/server"

async function queryNominatim(q: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&country=Brazil&q=${encodeURIComponent(
    q
  )}`
  const res = await fetch(url, {
    headers: { "User-Agent": "yello-solar-hub/1.0 (onboarding)" },
    // Nominatim requires a valid UA and reasonable usage
    next: { revalidate: 60 * 30 },
  })
  if (!res.ok) return null
  const data: any[] = await res.json()
  if (!data?.length) return null
  const { lat, lon, display_name } = data[0] || {}
  if (!lat || !lon) return null
  return { lat: Number(lat), lon: Number(lon), label: display_name }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const cepIn: string | undefined = body?.cep
    const address: string | undefined = body?.address

    if (!cepIn && !address) {
      return NextResponse.json({ error: "Informe cep ou address" }, { status: 400 })
    }

    const normalizeCep = (cep: string) => cep.replace(/[^0-9]/g, "")
    let cep = cepIn ? normalizeCep(cepIn) : undefined

    // 1) Se já enviou address, tenta direto Nominatim
    if (address) {
      const fromAddress = await queryNominatim(address)
      if (fromAddress) return NextResponse.json(fromAddress)
    }

    // 2) Tenta Nominatim pelo CEP
    if (cep) {
      const viaCepUrl = `https://viacep.com.br/ws/${cep}/json/`
      const r = await fetch(viaCepUrl, { next: { revalidate: 60 * 60 } })
      const j = await r.json()
      if (j?.erro) {
        // fallback: busca por CEP puro
        const byPostal = await queryNominatim(`${cep}, Brazil`)
        if (byPostal) return NextResponse.json(byPostal)
        return NextResponse.json({ error: "CEP inválido" }, { status: 400 })
      }
      const parts = [j.logradouro, j.bairro, j.localidade, j.uf, "Brasil"].filter(Boolean).join(", ")
      const found = await queryNominatim(parts)
      if (found) return NextResponse.json(found)
      // último recurso: cidade/UF
      const cityOnly = await queryNominatim(`${j.localidade}, ${j.uf}, Brasil`)
      if (cityOnly) return NextResponse.json(cityOnly)
      return NextResponse.json({ error: "Não foi possível geocodificar" }, { status: 404 })
    }

    return NextResponse.json({ error: "Entrada inválida" }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao geocodificar" }, { status: 500 })
  }
}

