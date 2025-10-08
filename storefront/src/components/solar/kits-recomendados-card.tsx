/**
 * 📦 Kits Recomendados Card
 */

'use client';

import React, { useState } from 'react';
import type { KitRecomendado } from '@/types/solar-calculator';

interface KitsRecomendadosCardProps {
    kits: KitRecomendado[];
    onKitSelect?: (kitId: string) => void;
}

export function KitsRecomendadosCard({ kits, onKitSelect }: KitsRecomendadosCardProps) {
    const [expandedKit, setExpandedKit] = useState<string | null>(null);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Excelente';
        if (score >= 70) return 'Bom';
        return 'Aceitável';
    };

    if (kits.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">📦</span>
                    Kits Recomendados
                </h3>
                <p className="text-gray-600 text-center py-8">
                    Nenhum kit disponível no momento. Entre em contato para cotação personalizada.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">📦</span>
                Kits Recomendados ({kits.length})
            </h3>

            <div className="space-y-4">
                {kits.map((kit, index) => (
                    <div
                        key={kit.kit_id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        {/* Header do Kit */}
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                                            #{index + 1}
                                        </span>
                                        {kit.disponibilidade.em_estoque && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                                ✓ Em estoque
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-1">{kit.nome}</h4>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span>⚡ {kit.potencia_kwp.toFixed(2)} kWp</span>
                                        {kit.disponibilidade.centro_distribuicao && (
                                            <span>📍 {kit.disponibilidade.centro_distribuicao}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900 mb-1">
                                        {formatCurrency(kit.preco_brl)}
                                    </div>
                                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-semibold ${getScoreColor(kit.match_score)}`}>
                                        <span>★</span>
                                        <span>{kit.match_score}</span>
                                        <span className="text-xs">({getScoreLabel(kit.match_score)})</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Componentes do Kit */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <button
                                onClick={() => setExpandedKit(expandedKit === kit.kit_id ? null : kit.kit_id)}
                                className="w-full flex items-center justify-between text-left text-sm font-medium text-gray-700 hover:text-gray-900"
                            >
                                <span>📋 Componentes do Kit</span>
                                <span className="text-xl">{expandedKit === kit.kit_id ? '−' : '+'}</span>
                            </button>

                            {expandedKit === kit.kit_id && (
                                <div className="mt-4 space-y-3 text-sm">
                                    {/* Painéis */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="font-semibold text-gray-900 mb-2">☀️ Painéis Solares</div>
                                        {kit.componentes.paineis.map((painel, i) => (
                                            <div key={i} className="text-gray-700">
                                                • {painel.quantidade}x {painel.marca} {painel.modelo || ''} ({painel.potencia_w}W)
                                                {painel.eficiencia && ` - ${painel.eficiencia}% eficiência`}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Inversores */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="font-semibold text-gray-900 mb-2">🔌 Inversor(es)</div>
                                        {kit.componentes.inversores.map((inversor, i) => (
                                            <div key={i} className="text-gray-700">
                                                • {inversor.quantidade}x {inversor.marca} {inversor.modelo || ''} ({inversor.potencia_kw}kW)
                                                {inversor.mppt && ` - ${inversor.mppt} MPPT`}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Baterias (se houver) */}
                                    {kit.componentes.baterias && kit.componentes.baterias.length > 0 && (
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="font-semibold text-gray-900 mb-2">🔋 Baterias</div>
                                            {kit.componentes.baterias.map((bateria, i) => (
                                                <div key={i} className="text-gray-700">
                                                    • {bateria.quantidade}x {bateria.marca} {bateria.modelo || ''} ({bateria.capacidade_kwh}kWh)
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Estrutura */}
                                    {kit.componentes.estrutura && (
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <div className="font-semibold text-gray-900 mb-2">🏗️ Estrutura</div>
                                            <div className="text-gray-700">
                                                • {kit.componentes.estrutura.tipo}
                                                {kit.componentes.estrutura.material && ` (${kit.componentes.estrutura.material})`}
                                            </div>
                                        </div>
                                    )}

                                    {/* Match Reasons */}
                                    {kit.match_reasons && kit.match_reasons.length > 0 && (
                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                                            <div className="font-semibold text-blue-900 mb-1">Por que este kit?</div>
                                            <ul className="text-blue-800 space-y-1">
                                                {kit.match_reasons.map((reason, i) => (
                                                    <li key={i}>✓ {reason}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer - Ações */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {kit.disponibilidade.prazo_entrega_dias && (
                                    <span>⏱️ Entrega em {kit.disponibilidade.prazo_entrega_dias} dias úteis</span>
                                )}
                            </div>
                            <button
                                onClick={() => onKitSelect?.(kit.kit_id)}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                Solicitar Cotação
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Observação */}
            <div className="mt-4 text-xs text-gray-500 text-center">
                Os kits são ranqueados por compatibilidade com suas necessidades. Preços podem variar.
            </div>
        </div>
    );
}
