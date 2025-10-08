/**
 * 🛒 Cart Integration Components
 * Componentes para integrar calculadora solar com carrinho
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { getSolarCalculatorUrl } from '@/modules/solar/integrations';

/**
 * Upsell de calculadora em carrinho vazio
 */
export function EmptyCartSolarUpsell({ countryCode = 'br' }: { countryCode?: string }) {
    return (
        <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-xl p-8 text-center">
            <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">☀️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Comece Economizando na Conta de Luz
                </h3>
                <p className="text-gray-600 mb-6">
                    Use nossa calculadora gratuita para descobrir quanto você pode economizar com energia solar
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href={getSolarCalculatorUrl(countryCode)}
                        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors"
                    >
                        🧮 Calcular Meu Sistema
                    </Link>
                    <Link
                        href="/products"
                        className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                    >
                        Ver Produtos
                    </Link>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-yellow-600">95%</div>
                        <div className="text-xs text-gray-600">Economia</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-orange-600">25+</div>
                        <div className="text-xs text-gray-600">Anos de Vida</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-red-600">3-5</div>
                        <div className="text-xs text-gray-600">Anos Payback</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Sugestão de calculadora para itens de kit solar no carrinho
 */
export function CartSolarKitSuggestion({
    itemName,
    countryCode = 'br',
}: {
    itemName: string;
    countryCode?: string;
}) {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">💡</span>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 mb-2">
                        <strong>Dica:</strong> Use a calculadora para validar se este kit é adequado ao seu consumo
                    </p>
                    <Link
                        href={getSolarCalculatorUrl(countryCode)}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-xs inline-flex items-center gap-1"
                    >
                        <span>Validar dimensionamento</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

/**
 * Banner de cross-sell: "Complete seu sistema"
 */
export function CompleteSystemBanner({ countryCode = 'br' }: { countryCode?: string }) {
    return (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">✨</div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">
                        Complete Seu Sistema Solar
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                        Tenha certeza de que você tem todos os componentes necessários para instalação
                    </p>
                    <Link
                        href={getSolarCalculatorUrl(countryCode)}
                        className="inline-flex items-center gap-1 text-green-700 hover:text-green-800 font-semibold text-sm"
                    >
                        <span>Ver checklist completo</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

/**
 * Sticky footer com ROI estimado
 */
export function CartSolarROISummary({
    totalPrice,
    estimatedKwp,
    countryCode = 'br',
}: {
    totalPrice: number;
    estimatedKwp?: number;
    countryCode?: string;
}) {
    // Estimativa rápida de economia (pode ser refinado com dados reais)
    const monthlyGeneration = estimatedKwp ? Math.round(estimatedKwp * 5.0 * 30) : 0;
    const monthlySavings = monthlyGeneration ? Math.round(monthlyGeneration * 0.8) : 0; // Assumindo R$ 0.80/kWh
    const paybackMonths = monthlySavings > 0 ? Math.round(totalPrice / monthlySavings) : 0;

    if (!estimatedKwp || estimatedKwp === 0) return null;

    return (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                        📈 Estimativa de Retorno
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-700">
                        <div>
                            <span className="font-bold text-purple-600">R$ {monthlySavings}</span>/mês
                        </div>
                        <div className="h-4 w-px bg-gray-300" />
                        <div>
                            Payback: <span className="font-bold text-indigo-600">{paybackMonths} meses</span>
                        </div>
                    </div>
                </div>
                <Link
                    href={getSolarCalculatorUrl(countryCode)}
                    className="flex-shrink-0 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    Calcular Exato
                </Link>
            </div>
        </div>
    );
}

/**
 * Modal/tooltip de ajuda para dimensionamento
 */
export function CartSolarHelpTooltip({ countryCode = 'br' }: { countryCode?: string }) {
    return (
        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <span>Não tem certeza do tamanho?</span>
            <Link
                href={getSolarCalculatorUrl(countryCode)}
                className="text-yellow-600 hover:text-yellow-700 font-semibold inline-flex items-center gap-1"
            >
                <span>🧮 Calcular</span>
            </Link>
        </div>
    );
}
