/**
 * 💼 Quotes Integration Components
 * Componentes para integrar calculadora solar com sistema de cotações
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { getSolarCalculatorUrl } from '@/modules/configuration/solar/integrations';
import type { SolarCalculationInput, SolarCalculationOutput } from '@/types/solar-calculator';

/**
 * Badge "Gerado pela Calculadora" em cotações
 */
export function CalculatorGeneratedBadge() {
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full text-xs font-semibold text-yellow-900">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Calculado automaticamente</span>
        </div>
    );
}

/**
 * Resumo do cálculo original na cotação
 */
export function QuoteCalculationSummary({
    input,
    output,
}: {
    input: Partial<SolarCalculationInput>;
    output: Partial<SolarCalculationOutput>;
}) {
    if (!input || !output?.dimensionamento || !output?.financeiro) return null;

    const consumo = input.consumo_kwh_mes || 0;
    const tarifa = input.tarifa_energia_kwh || 0;
    const kwp = output.dimensionamento.kwp_proposto || 0;
    const investimento = output.financeiro.capex?.total_brl || 0;
    const economiaAnual = output.financeiro.economia?.anual_brl || 0;
    const payback = output.financeiro.retorno?.payback_simples_anos || 0;

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">🧮</div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-3">Dados da Calculadora</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <div className="text-gray-600 mb-0.5">Consumo Médio</div>
                            <div className="font-semibold text-gray-900">
                                {consumo.toLocaleString('pt-BR')} kWh/mês
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-600 mb-0.5">Tarifa</div>
                            <div className="font-semibold text-gray-900">
                                R$ {tarifa.toFixed(2)}/kWh
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-600 mb-0.5">Sistema Recomendado</div>
                            <div className="font-semibold text-gray-900">
                                {kwp.toFixed(2)} kWp
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-600 mb-0.5">Investimento</div>
                            <div className="font-semibold text-yellow-600">
                                R$ {investimento.toLocaleString('pt-BR')}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-600 mb-0.5">Economia Anual</div>
                            <div className="font-semibold text-green-600">
                                R$ {economiaAnual.toLocaleString('pt-BR')}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-600 mb-0.5">Payback</div>
                            <div className="font-semibold text-blue-600">
                                {payback.toFixed(1)} anos
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * CTA para criar cotação a partir da calculadora
 */
export function CreateQuoteFromCalculatorCTA({ countryCode = 'br' }: { countryCode?: string }) {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl">
                    📋
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Solicite uma Cotação Personalizada
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Use nossa calculadora para gerar uma cotação automaticamente com todos os detalhes do seu projeto
                    </p>
                </div>
                <Link
                    href={getSolarCalculatorUrl(countryCode)}
                    className="flex-shrink-0 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap"
                >
                    Calcular & Cotar
                </Link>
            </div>
        </div>
    );
}

/**
 * Widget de comparação entre cotações calculadas
 */
export function CompareCalculatedQuotes({
    quotes,
}: {
    quotes: Array<{
        id: string;
        systemSize: number;
        investment: number;
        payback: number;
        roi: number;
    }>;
}) {
    if (quotes.length < 2) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">Comparar Cotações</h4>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">Sistema</th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-700">Investimento</th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-700">Payback</th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-700">ROI 25 anos</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {quotes.map((quote) => (
                            <tr key={quote.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-gray-900">
                                    {quote.systemSize.toFixed(2)} kWp
                                </td>
                                <td className="px-4 py-3 text-right text-gray-700">
                                    R$ {quote.investment.toLocaleString('pt-BR')}
                                </td>
                                <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                                    {quote.payback.toFixed(1)} anos
                                </td>
                                <td className="px-4 py-3 text-right text-green-600 font-semibold">
                                    {quote.roi.toFixed(0)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/**
 * Status de aprovação com validação de cálculo
 */
export function QuoteApprovalWithCalculation({
    isCalculated,
    countryCode = 'br',
}: {
    isCalculated: boolean;
    countryCode?: string;
}) {
    if (isCalculated) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-300 rounded-lg text-sm">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold text-green-900">Dimensionamento Validado</span>
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 border border-yellow-300 rounded-lg text-sm">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold text-yellow-900">Requer Validação</span>
            <Link
                href={getSolarCalculatorUrl(countryCode)}
                className="ml-2 text-yellow-700 hover:text-yellow-800 underline"
            >
                Calcular
            </Link>
        </div>
    );
}

/**
 * Empty state para lista de cotações
 */
export function EmptyQuotesWithCalculator({ countryCode = 'br' }: { countryCode?: string }) {
    return (
        <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Nenhuma Cotação Ainda
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Use nossa calculadora solar para gerar automaticamente uma cotação detalhada do seu projeto
            </p>
            <div className="flex gap-3 justify-center">
                <Link
                    href={getSolarCalculatorUrl(countryCode)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                >
                    🧮 Calcular & Cotar
                </Link>
                <Link
                    href="/products"
                    className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                    Ver Produtos
                </Link>
            </div>
        </div>
    );
}
