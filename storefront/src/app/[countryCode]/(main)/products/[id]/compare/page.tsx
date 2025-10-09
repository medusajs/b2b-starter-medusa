import { compareSKUPrices } from "@/lib/data/catalog";
import { PriceComparisonComponent } from "@/modules/products/components/price-comparison";
import { notFound } from "next/navigation";

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
 */
export default async function ProductComparisonPage({
    params,
}: ProductComparisonPageProps) {
    try {
        const comparison = await compareSKUPrices(params.id);

        return (
            <div className="content-container py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {comparison.sku.name}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {comparison.sku.description || comparison.sku.model_number}
                    </p>
                </div>

                <PriceComparisonComponent comparison={comparison} />
            </div>
        );
    } catch (error) {
        console.error("Erro ao carregar comparação:", error);
        notFound();
    }
}
