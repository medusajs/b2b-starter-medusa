// TODO: Implementar integração com API de comparação de preços
// import { compareSKUPrices } from "@/lib/data/catalog";
// import { PriceComparisonComponent } from "@/modules/products/components/price-comparison";

interface ProductComparisonPageProps {
    params: {
        id: string;
    };
}

/**
 * Página de comparação de preços de um produto
 * Exibe múltiplas ofertas de distribuidores
 * 
 * Rota: /[countryCode]/(main)/products/[id]/compare
 * 
 * NOTA: Feature em desenvolvimento - API de comparação pendente
 */
export default async function ProductComparisonPage({
    params,
}: ProductComparisonPageProps) {
    return (
        <div className="content-container py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Comparação de Preços
                </h1>
                <p className="mt-2 text-gray-600">
                    Feature em desenvolvimento. Em breve você poderá comparar preços de múltiplos distribuidores.
                </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
                <svg className="mx-auto h-16 w-16 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Comparação de Preços - Em Breve
                </h2>
                <p className="text-gray-600">
                    Estamos trabalhando para trazer a melhor experiência de comparação de preços para você.
                </p>
            </div>
        </div>
    );
}
