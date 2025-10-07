export type Variant = "default" | "curto" | "micro"

type DeepRecord = Record<string, any>

const ptBR: DeepRecord = {
  common: {
    cta_simular: { default: "Simular agora", curto: "Simular", micro: "Simular" },
    cta_cotar: { default: "Pedir cotação", curto: "Cotação", micro: "Cotar" },
    cta_finalizar: { default: "Finalizar pedido", curto: "Finalizar", micro: "Pagar" },
  },
  home: {
    hero_title: {
      default: "Energia solar do seu jeito — do kit ao financiamento",
      curto: "Energia solar do seu jeito",
      micro: "Solar do seu jeito",
    },
    hero_sub: {
      default: "Compare kits, simule economia e acompanhe a instalação com suporte especialista.",
      curto: "Compare kits e simule economia.",
      micro: "Compare e simule.",
    },
    hero_cta_primary: { default: "Explorar soluções", curto: "Soluções", micro: "Soluções" },
    hero_cta_secondary: { default: "Ver produtos", curto: "Produtos", micro: "Produtos" },
    solutions_title: { default: "Soluções por Perfil", curto: "Soluções por perfil", micro: "Por perfil" },
    solutions_sub: {
      default: "Escolha a solução ideal por classe consumidora e modalidade energética.",
      curto: "Escolha por classe e modalidade.",
      micro: "Classe e modalidade.",
    },
  },
  plp: {
    filtros_title: { default: "Filtre por {atributo}", curto: "Filtre", micro: "Filtro" },
    search_in_results: { default: "Buscar produtos" },
    filtros_labels: {
      potencia: "Potência",
      tensao: "Tensão",
      telhado: "Telhado",
      marca: "Marca",
      modalidade: "Modalidade",
    },
    chips_limpar: { default: "Limpar", curto: "Limpar", micro: "Limpar" },
    empty_state: {
      default: "Nenhum item encontrado. Ajuste os filtros.",
      curto: "Nada encontrado.",
      micro: "Sem itens.",
    },
  },
  solutions: {
    card_b1_title: { default: "Residencial B1" },
    card_b1_desc: { default: "Kits on-grid para economizar na conta de luz." },
    card_b2_title: { default: "Rural B2" },
    card_b2_desc: { default: "Soluções off-grid e híbridas para áreas rurais." },
    card_b3_title: { default: "Comercial/PME B3" },
    card_b3_desc: { default: "Sistemas sob medida para negócios, com ROI claro." },
    card_gc_title: { default: "Condomínios" },
    card_gc_desc: { default: "Geração compartilhada para áreas comuns e unidades." },
    card_ind_title: { default: "Indústria/Grandes" },
    card_ind_desc: { default: "EaaS e PPA com previsibilidade e SLA." },
  },
  quote: {
    status: {
      pending: "Pendente",
      review: "Em revisão",
      approved: "Aprovada",
      expired: "Expirada",
      rejected: "Rejeitada",
    },
    view_details: { default: "Ver detalhes" },
    financing_badge: { default: "Financiamento disponível" },
  },
  videos: {
    amazonia: {
      src: "/videos/amazonia.mp4",
      alt: "Painéis solares na Amazônia",
      caption: "Energia limpa em comunidades ribeirinhas.",
      poster: "/opengraph-image.jpg",
    },
    condominio: {
      src: "/videos/condominio.mp4",
      alt: "Geração compartilhada em condomínio",
      caption: "Energia para áreas comuns e unidades.",
      poster: "/opengraph-image.jpg",
    },
    pousada: {
      src: "/videos/pousada.mp4",
      alt: "Pousada com sistema fotovoltaico",
      caption: "Autonomia e redução de custos operacionais.",
      poster: "/opengraph-image.jpg",
    },
    rural: {
      src: "/videos/rural.mp4",
      alt: "Sistema solar em área rural",
      caption: "Off-grid e híbrido para o campo.",
      poster: "/opengraph-image.jpg",
    },
  },
}

export function t(key: string, variant: Variant = "default"): string {
  const parts = key.split(".")
  let node: any = ptBR
  for (const p of parts) {
    if (!node) break
    node = node[p]
  }
  if (!node) return key
  if (typeof node === "string") return node
  if (node && typeof node[variant] === "string") return node[variant]
  if (node && typeof node["default"] === "string") return node["default"]
  return key
}

export function getCopyNamespace(ns: string) {
  const parts = ns.split(".")
  let node: any = ptBR
  for (const p of parts) {
    if (!node) break
    node = node[p]
  }
  return node || {}
}

