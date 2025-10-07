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
      default: "Conta de luz te dominando? Domine de volta.",
      curto: "Domine a conta de luz.",
      micro: "Domine a conta.",
    },
    hero_sub: {
      default: "Simule em 30s com dados ANEEL — sem cadastro chato.",
      curto: "Simule em 30s (ANEEL).",
      micro: "Simule em 30s.",
    },
    hero_cta_primary: { default: "Bora calcular agora", curto: "Calcular agora", micro: "Calcular" },
    hero_cta_secondary: { default: "Ver kits prontos", curto: "Kits prontos", micro: "Kits" },
    solutions_title: { default: "Soluções por Perfil", curto: "Soluções por perfil", micro: "Por perfil" },
    solutions_sub: {
      default: "Escolha a solução ideal por classe consumidora e modalidade energética.",
      curto: "Escolha por classe e modalidade.",
      micro: "Classe e modalidade.",
    },
  },
  form: {
    errors: {
      required: "Faltou esse aqui. Dois toques e segue o baile.",
      cep: "Esse CEP não bateu. Confere ou me deixa localizar.",
      range: "Hmm… número estranho. Confere os dígitos.",
    },
  },
  pdp: {
    roi_badge: "ROI em ~{{roi_anos}} anos*",
    roi_note: "*Estimativa com base em ANEEL/consumo informado.",
    cta_buy: "Fechar esse kit",
    cta_compare: "Comparar com outro",
  },
  config: {
    heading: "Teu telhado, tuas regras — eu otimizo.",
    tooltip_inclinacao: "Inclinação = quanto o painel ‘deita’. Perto do ideal, mais geração.",
    shadow_error: "Sombra braba aqui. Quer ver plano com microinversor?",
  },
  checkout: {
    options: "Pix à vista, cartão, ou crédito solar sem drama.",
    cta_finance: "Quero financiar",
    cta_pix: "Pagar no Pix",
  },
  status: {
    homolog: "Papeis no trilho da concessionária. Eu aviso cada virada.",
    art_missing: "Faltou a ART assinada. Sobe aqui que eu valido.",
  },
  om: {
    warn_light: "Geração abaixo do normal. Provável sujeira — 5 min de mangueira resolvem.",
    alert_inverter: "Inversor {{modelo}} caiu. Abrindo ticket automático — sem estresse.",
  },
  toasts: {
    ok: "Feito! Teu projeto subiu pra validação.",
    almost: "Quase lá — confirma a fase elétrica e eu libero a proposta.",
    confirm_switch: "Certeza que quer trocar de kit agora? Eu salvo o anterior.",
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
