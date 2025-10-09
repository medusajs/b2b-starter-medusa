"use client";

import { PriceComparison } from "@/lib/data/catalog";
import { formatAmount } from "@/lib/util/prices";

interface PriceComparisonProps {
    comparison: PriceComparison;
    currencyCode?: string;
}

/**
 * Componente de comparação de preços multi-distribuidor
 * Exibe ofertas ordenadas por preço com economia potencial
 */
export function PriceComparisonComponent({
    comparison,
    currencyCode = "brl",
}: PriceComparisonProps) {
    const { sku, offers, comparison: stats } = comparison;

    if (!offers || offers.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <p className="text-sm text-gray-600">
                    Nenhuma oferta disponível para este produto no momento.
                </p>
            </div>
        );
    }

    const bestOffer = offers[0];
    const hasMultipleOffers = offers.length > 1;

    return (
        <div className="space-y-6">
            {/* Cabeçalho com estatísticas */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Comparação de Preços
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                            {stats.total_offers}{" "}
                            {stats.total_offers === 1 ? "distribuidor" : "distribuidores"}
                        </p>
                    </div>

                    {hasMultipleOffers && parseFloat(stats.max_savings_pct) > 0 && (
                        <div className="rounded-lg bg-green-100 px-4 py-2">
                            <p className="text-xs font-medium text-green-800">
                                Economize até
                            </p>
                            <p className="text-2xl font-bold text-green-900">
                                {stats.max_savings_pct}%
                            </p>
                            <p className="text-xs text-green-700">
                                {formatAmount({
                                    amount: parseFloat(stats.max_savings) * 100,
                                    region: {
                                        currency_code: currencyCode,
                                    } as any,
                                })}
                            </p>
                        </div>
                    )}
                </div>

                {hasMultipleOffers && (
                    <div className="mt-4 grid grid-cols-3 gap-4 border-t border-blue-200 pt-4">
                        <div>
                            <p className="text-xs text-gray-600">Menor preço</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {formatAmount({
                                    amount: stats.lowest_price * 100,
                                    region: {
                                        currency_code: currencyCode,
                                    } as any,
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Preço médio</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {formatAmount({
                                    amount: parseFloat(stats.average_price) * 100,
                                    region: {
                                        currency_code: currencyCode,
                                    } as any,
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Maior preço</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {formatAmount({
                                    amount: stats.highest_price * 100,
                                    region: {
                                        currency_code: currencyCode,
                                    } as any,
                                })}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de ofertas */}
            <div className="space-y-3">
                {offers.map((offer, index) => {
                    const isBest = offer.is_best_price;
                    const savings = parseFloat(offer.savings_vs_highest);
                    const priceDiff = parseFloat(offer.price_difference_pct);

                    return (
                        <div
                            key={offer.id}
                            className={`rounded-lg border p-4 transition-all hover:shadow-md ${isBest
                                    ? "border-green-400 bg-green-50 ring-2 ring-green-200"
                                    : "border-gray-200 bg-white"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                {/* Distribuidor */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-gray-900">
                                            {offer.distributor_name}
                                        </h4>
                                        {isBest && (
                                            <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                                                Melhor Preço
                                            </span>
                                        )}
                                        {index === 0 && !isBest && (
                                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                                                Oferta Destacada
                                            </span>
                                        )}
                                    </div>

                                    {/* Informações adicionais */}
                                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                                        {offer.stock_status !== "unknown" && (
                                            <span>
                                                {offer.stock_status === "in_stock" && "✅ Em estoque"}
                                                {offer.stock_status === "low_stock" &&
                                                    "⚠️ Estoque baixo"}
                                                {offer.stock_status === "out_of_stock" &&
                                                    "❌ Sem estoque"}
                                            </span>
                                        )}

                                        {offer.stock_quantity && (
                                            <span>Qtd: {offer.stock_quantity}</span>
                                        )}

                                        {offer.lead_time_days && (
                                            <span>Entrega: {offer.lead_time_days} dias</span>
                                        )}

                                        {offer.min_order_quantity > 1 && (
                                            <span>Mín: {offer.min_order_quantity} un</span>
                                        )}

                                        {offer.shipping_cost && (
                                            <span>
                                                Frete:{" "}
                                                {formatAmount({
                                                    amount: offer.shipping_cost * 100,
                                                    region: {
                                                        currency_code: currencyCode,
                                                    } as any,
                                                })}
                                            </span>
                                        )}

                                        {offer.free_shipping_threshold && (
                                            <span>
                                                Frete grátis acima de{" "}
                                                {formatAmount({
                                                    amount: offer.free_shipping_threshold * 100,
                                                    region: {
                                                        currency_code: currencyCode,
                                                    } as any,
                                                })}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Preço e ações */}
                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-right">
                                        {offer.original_price &&
                                            offer.original_price > offer.price && (
                                                <p className="text-sm text-gray-500 line-through">
                                                    {formatAmount({
                                                        amount: offer.original_price * 100,
                                                        region: {
                                                            currency_code: currencyCode,
                                                        } as any,
                                                    })}
                                                </p>
                                            )}
                                        <p
                                            className={`text-2xl font-bold ${isBest ? "text-green-700" : "text-gray-900"
                                                }`}
                                        >
                                            {formatAmount({
                                                amount: offer.price * 100,
                                                region: {
                                                    currency_code: currencyCode,
                                                } as any,
                                            })}
                                        </p>
                                        {hasMultipleOffers && !isBest && priceDiff > 0 && (
                                            <p className="text-xs text-red-600">
                                                +{priceDiff.toFixed(1)}% vs. melhor
                                            </p>
                                        )}
                                        {hasMultipleOffers && savings > 0 && (
                                            <p className="text-xs text-green-600">
                                                Economia: R$ {savings.toFixed(2)}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        className={`rounded-lg px-6 py-2 font-medium transition-colors ${isBest
                                                ? "bg-green-600 text-white hover:bg-green-700"
                                                : "bg-gray-900 text-white hover:bg-gray-800"
                                            }`}
                                        onClick={() => {
                                            // TODO: Adicionar ao carrinho com oferta específica
                                            console.log("Add to cart:", offer);
                                        }}
                                    >
                                        Adicionar ao Carrinho
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Rodapé informativo */}
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                <p>
                    💡 <strong>Dica:</strong> Preços atualizados em tempo real. A economia
                    final pode variar de acordo com frete e condições de pagamento.
                </p>
                {hasMultipleOffers && (
                    <p className="mt-2">
                        Comparamos {stats.total_offers} ofertas para encontrar o melhor
                        preço para você. Economize até{" "}
                        <strong className="text-green-700">
                            {formatAmount({
                                amount: parseFloat(stats.max_savings) * 100,
                                region: {
                                    currency_code: currencyCode,
                                } as any,
                            })}
                        </strong>{" "}
                        escolhendo o distribuidor certo!
                    </p>
                )}
            </div>
        </div>
    );
}
