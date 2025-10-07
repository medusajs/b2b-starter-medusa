export type AneelTariff = {
  distributor: string
  class: string
  te: number | null // Tarifa de Energia (R$/kWh)
  tusd: number | null // Tarifa de Uso do Sistema de Distribuição (R$/kWh)
  source_url: string
  as_of?: string
}

// Blueprint: ajuste para a fonte/dataset correto e normalização.
export async function fetchAneelTariff(
  distributor: string,
  tariffClass: string
): Promise<AneelTariff> {
  // Placeholder minimalista: devolve nulls com fonte e distribuidora
  // Integração real pode consumir o dataset oficial (CSV/JSON) e filtrar por classe/subclasse
  return {
    distributor,
    class: tariffClass,
    te: null,
    tusd: null,
    source_url:
      "https://dadosabertos.aneel.gov.br/dataset/tarifas-distribuidoras-energia-eletrica",
  }
}

