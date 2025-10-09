import { Metadata } from "next"
import SolutionsByClass from "@/modules/home/components/solutions-by-class"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import SolutionsView from "@/modules/analytics/solutions-view"

export const metadata: Metadata = {
  title: "Soluções por Classe e Modalidade | Yello Solar Hub",
  description:
    "Encontre soluções solares por classe consumidora (B1/B2/B3, Condomínios, Indústria) e modalidade (on-grid, híbrido, off-grid, GC, EaaS/PPA).",
}

export default async function SolutionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ classe?: string }>
}) {
  const params = (await searchParams) || {}
  const classe = params.classe

  return (
    <div className="flex flex-col">
      <div className="content-container py-8">
        <h1 className="text-2xl font-semibold mb-2">Soluções por Perfil</h1>
        <p className="text-neutral-600 mb-6">
          Escolha seu perfil e modalidade para ver recomendações e iniciar sua
          cotação.
        </p>
        <SolutionsView classe={classe} />
        <SolutionsByClass />
        <div className="mt-6 flex">
          <LocalizedClientLink
            href="/categories"
            className="inline-flex items-center justify-center rounded-md bg-ui-button-inverted px-6 py-3 text-base font-medium text-ui-fg-on-inverted hover:bg-ui-button-inverted-hover"
        </div>
      </div>
    </div>
  )
}
