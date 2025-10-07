// Classe -> possíveis fragmentos de handle de categoria
// Ajuste aqui para garantir 100% de correspondência com suas categorias reais.
const defaultMap: Record<string, string[]> = {
  "residencial-b1": ["residencial", "kits-residenciais", "b1"],
  "rural-b2": ["rural", "b2"],
  "comercial-b3": ["comercial", "pme", "b3"],
  condominios: ["condominio", "condomínio", "gc"],
  industria: ["industria", "industrial", "grandes", "enterprise"],
}

// Allow override via NEXT_PUBLIC_YSH_CLASSE_HANDLES as JSON, e.g.:
// {"residencial-b1":["residencial","kits"],"comercial-b3":["comercial"]}
let override: Record<string, string[]> | undefined
try {
  const raw = process.env.NEXT_PUBLIC_YSH_CLASSE_HANDLES
  if (raw) override = JSON.parse(raw)
} catch {}

export const classeHandleMap: Record<string, string[]> = Object.freeze({
  ...defaultMap,
  ...(override || {}),
})
