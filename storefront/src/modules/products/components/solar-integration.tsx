/**
 * 📦 Product Integration Components
 * Componentes para conectar produtos com calculadora solar
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { getSolarCalculatorUrl } from '@/modules/solar/integrations';

/**
 * Badge "Dimensionar Sistema" em produtos de kit solar
 */
export function SolarCalculatorBadge({ countryCode = 'br' }: { countryCode?: string }) {
    return (
        <Link
            href={getSolarCalculatorUrl(countryCode)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded-lg text-sm font-semibold text-yellow-900 transition-colors"
        >
            <span>🧮</span>
            <span>Dimensionar Sistema Completo</span>
        </Link>
    );
}

/**
 * Sugestão de calculadora em produtos solares
 */
export function SolarCalculatorSuggestion({
    productName,
    countryCode = 'br',
}: {
    productName: string;
    countryCode?: string;
}) {
    return (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-3xl">💡</div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">
                        Não sabe qual sistema é ideal para você?
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                        Use nossa calculadora gratuita para dimensionar o sistema solar perfeito baseado no seu consumo de energia.
                    </p>
                    <Link
                        href={getSolarCalculatorUrl(countryCode)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-sm rounded-lg transition-colors"
                    >
                        <span>🧮</span>
                        <span>Calcular Meu Sistema</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

/**
 * Comparação rápida: produto vs. sistema ideal
 */
export function ProductVsIdealSystem({
    productKwp,
    countryCode = 'br',
}: {
    productKwp: number;
    countryCode?: string;
}) {
    // Estimativa rápida de geração mensal (assumindo HSP médio de 5.0)
    const estimatedMonthlyGeneration = Math.round(productKwp * 5.0 * 30);

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">📊</div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                        Este sistema de {productKwp} kWp pode gerar:
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1 mb-3">
                        <li>• ~{estimatedMonthlyGeneration} kWh/mês (média)</li>
                        <li>• ~{Math.round(estimatedMonthlyGeneration * 12)} kWh/ano</li>
                        <li>• Ideal para consumos de até {Math.round(estimatedMonthlyGeneration * 0.9)} kWh/mês</li>
                    </ul>
                    <Link
                        href={getSolarCalculatorUrl(countryCode)}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1"
                    >
                        <span>Calcular sistema personalizado</span>
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
 * Widget "Kits Relacionados" com link para calculadora
 */
export function RelatedKitsWidget({ countryCode = 'br' }: { countryCode?: string }) {
    return (
        <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Encontre o Kit Ideal</h3>
                <Link
                    href={getSolarCalculatorUrl(countryCode)}
                    className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm inline-flex items-center gap-1"
                >
                    <span>Ver calculadora</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
            <p className="text-sm text-gray-600 mb-4">
                Nossa calculadora solar recomenda automaticamente os kits mais adequados para o seu consumo de energia.
            </p>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="text-xs font-semibold text-gray-900">Cálculo Preciso</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">💰</div>
                    <div className="text-xs font-semibold text-gray-900">ROI Detalhado</div>
                </div>
            </div>
        </div>
    );
}

/**
 * Banner inline para categoria de produtos solares
 */
export function SolarCategoryBanner({ countryCode = 'br' }: { countryCode?: string }) {
    return (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-6 text-white mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl">
                        ☀️
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-1">
                            Calcule Seu Sistema Solar Ideal
                        </h3>
                        <p className="text-white/90 text-sm">
                            Descubra qual kit é perfeito para você em menos de 1 minuto
                        </p>
                    </div>
                </div>
                <Link
                    href={getSolarCalculatorUrl(countryCode)}
                    className="flex-shrink-0 px-6 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                    Calcular Agora →
                </Link>
            </div>
        </div>
    );
}
