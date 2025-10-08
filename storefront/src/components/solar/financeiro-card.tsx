/**
 * 💰 Financeiro Card
 */

'use client';

import React from 'react';
import type { AnaliseFinanceira } from '@/types/solar-calculator';

interface FinanceiroCardProps {
    financeiro: AnaliseFinanceira;
}

export function FinanceiroCard({ financeiro }: FinanceiroCardProps) {
    const { capex, economia, retorno, financiamento } = financeiro;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatYears = (years: number) => {
        const y = Math.floor(years);
        const m = Math.round((years - y) * 12);
        if (m === 0) return `${y} anos`;
        return `${y} anos e ${m} meses`;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">💰</span>
                Análise Financeira
            </h3>

            <div className="space-y-4">
                {/* Investimento Total */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">Investimento Total</span>
                        <span className="text-3xl font-bold text-blue-600">
                            {formatCurrency(capex.total_brl)}
                        </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                            <span>• Equipamentos:</span>
                            <span>{formatCurrency(capex.equipamentos_brl)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>• Instalação:</span>
                            <span>{formatCurrency(capex.instalacao_brl)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>• Projeto + Homologação:</span>
                            <span>{formatCurrency(capex.projeto_brl + capex.homologacao_brl)}</span>
                        </div>
                    </div>
                </div>

                {/* Economia */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">📊 Economia de Energia</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-700">Mensal:</span>
                            <span className="font-bold text-green-600">{formatCurrency(economia.mensal_brl)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">Anual:</span>
                            <span className="font-bold text-green-600">{formatCurrency(economia.anual_brl)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-700">25 anos:</span>
                            <span className="font-bold text-green-600">{formatCurrency(economia.total_25anos_brl)}</span>
                        </div>
                    </div>
                </div>

                {/* Retorno do Investimento */}
                <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">🎯 Retorno do Investimento</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-600 mb-1">Payback Simples</div>
                            <div className="font-bold text-gray-900">
                                {formatYears(retorno.payback_simples_anos)}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-600 mb-1">TIR</div>
                            <div className="font-bold text-gray-900">
                                {retorno.tir_percentual.toFixed(1)}% a.a.
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-600 mb-1">VPL (25 anos)</div>
                            <div className="font-bold text-gray-900 text-sm">
                                {formatCurrency(retorno.vpl_brl)}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-600 mb-1">Economia %</div>
                            <div className="font-bold text-green-600">
                                {economia.economia_percentual.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financiamento (se disponível) */}
                {financiamento && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">💳 Opção de Financiamento</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-700">Parcela mensal:</span>
                                <span className="font-bold text-purple-600">
                                    {formatCurrency(financiamento.parcela_mensal_brl)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">Economia líquida:</span>
                                <span className="font-bold text-green-600">
                                    {formatCurrency(financiamento.economia_liquida_mensal_brl)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Indicador de Viabilidade */}
                {retorno.tir_percentual > 12 && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 text-sm">
                        <span className="text-green-800">
                            ✅ <strong>Investimento Viável!</strong> TIR acima da SELIC.
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
