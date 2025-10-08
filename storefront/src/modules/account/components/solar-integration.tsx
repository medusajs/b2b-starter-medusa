/**
 * 👤 Account Integration Components
 * Componentes para integrar calculadora solar com perfil do usuário
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { getSolarCalculatorUrl } from '@/modules/solar/integrations';

/**
 * Widget "Meus Cálculos Solares" no dashboard
 */
export function MyCalculationsDashboardWidget({
    calculationsCount,
    latestCalculation,
    countryCode = 'br',
}: {
    calculationsCount: number;
    latestCalculation?: {
        id: string;
        systemSize: number;
        investment: number;
        createdAt: Date;
    };
    countryCode?: string;
}) {
    return (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl">
                        ☀️
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Sistemas Calculados</h3>
                        <p className="text-sm text-gray-600">{calculationsCount} cálculos salvos</p>
                    </div>
                </div>
                <Link
                    href={getSolarCalculatorUrl(countryCode)}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-sm rounded-lg transition-colors"
                >
                    Novo Cálculo
                </Link>
            </div>

            {latestCalculation ? (
                <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">Último cálculo</span>
                        <span className="text-xs text-gray-500">
                            {new Date(latestCalculation.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <div className="text-gray-600 mb-0.5">Sistema</div>
                            <div className="font-bold text-gray-900">
                                {latestCalculation.systemSize.toFixed(2)} kWp
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-600 mb-0.5">Investimento</div>
                            <div className="font-bold text-yellow-600">
                                R$ {latestCalculation.investment.toLocaleString('pt-BR')}
                            </div>
                        </div>
                    </div>
                    <Link
                        href={`/account/calculations/${latestCalculation.id}`}
                        className="mt-3 block text-center text-sm text-yellow-700 hover:text-yellow-800 font-semibold"
                    >
                        Ver detalhes →
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg p-4 border border-yellow-200 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                        Nenhum cálculo salvo ainda
                    </p>
                    <Link
                        href={getSolarCalculatorUrl(countryCode)}
                        className="text-sm text-yellow-700 hover:text-yellow-800 font-semibold"
                    >
                        Fazer primeiro cálculo →
                    </Link>
                </div>
            )}
        </div>
    );
}

/**
 * Lista de cálculos salvos
 */
export function SavedCalculationsList({
    calculations,
    countryCode = 'br',
}: {
    calculations: Array<{
        id: string;
        name?: string;
        systemSize: number;
        investment: number;
        payback: number;
        createdAt: Date;
    }>;
    countryCode?: string;
}) {
    if (calculations.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                <div className="text-6xl mb-4">🧮</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Nenhum Cálculo Salvo
                </h3>
                <p className="text-gray-600 mb-6">
                    Seus cálculos de sistema solar aparecerão aqui
                </p>
                <Link
                    href={getSolarCalculatorUrl(countryCode)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors"
                >
                    <span>☀️</span>
                    <span>Calcular Sistema Solar</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {calculations.map((calc) => (
                <Link
                    key={calc.id}
                    href={`/account/calculations/${calc.id}`}
                    className="block bg-white border border-gray-200 hover:border-yellow-400 rounded-lg p-4 transition-all hover:shadow-md"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900 truncate">
                                    {calc.name || `Sistema ${calc.systemSize.toFixed(2)} kWp`}
                                </h4>
                                <span className="flex-shrink-0 text-xs text-gray-500">
                                    {new Date(calc.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                                <div>
                                    <div className="text-gray-600 text-xs mb-0.5">Sistema</div>
                                    <div className="font-semibold text-gray-900">
                                        {calc.systemSize.toFixed(2)} kWp
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-600 text-xs mb-0.5">Investimento</div>
                                    <div className="font-semibold text-yellow-600">
                                        R$ {calc.investment.toLocaleString('pt-BR')}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-600 text-xs mb-0.5">Payback</div>
                                    <div className="font-semibold text-blue-600">
                                        {calc.payback.toFixed(1)} anos
                                    </div>
                                </div>
                            </div>
                        </div>
                        <svg className="flex-shrink-0 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>
            ))}
        </div>
    );
}

/**
 * Botão de compartilhamento de cálculo
 */
export function ShareCalculationButton({ calculationId }: { calculationId: string }) {
    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/solar/calculation/${calculationId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Meu Cálculo de Sistema Solar',
                    text: 'Veja o dimensionamento do meu sistema solar fotovoltaico',
                    url: shareUrl,
                });
            } catch (err) {
                // Usuário cancelou ou erro
            }
        } else {
            // Fallback: copiar para clipboard
            await navigator.clipboard.writeText(shareUrl);
            alert('Link copiado para a área de transferência!');
        }
    };

    return (
        <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-700 font-semibold text-sm rounded-lg transition-colors"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Compartilhar</span>
        </button>
    );
}

/**
 * Comparador de cálculos salvos
 */
export function CompareCalculationsButton({ selectedIds }: { selectedIds: string[] }) {
    if (selectedIds.length < 2) {
        return (
            <button
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 text-gray-400 font-semibold text-sm rounded-lg cursor-not-allowed"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Comparar ({selectedIds.length}/2+)</span>
            </button>
        );
    }

    return (
        <Link
            href={`/account/calculations/compare?ids=${selectedIds.join(',')}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-lg transition-colors"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Comparar {selectedIds.length} Cálculos</span>
        </Link>
    );
}

/**
 * Banner de incentivo para salvar cálculo (para usuários não logados)
 */
export function SaveCalculationPrompt({ countryCode = 'br' }: { countryCode?: string }) {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">💾</div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">
                        Salve Seus Cálculos
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                        Faça login para salvar este cálculo, comparar diferentes sistemas e acessar de qualquer dispositivo
                    </p>
                    <div className="flex gap-2">
                        <Link
                            href="/account/login"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors"
                        >
                            Fazer Login
                        </Link>
                        <Link
                            href="/account/register"
                            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg transition-colors"
                        >
                            Criar Conta
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
