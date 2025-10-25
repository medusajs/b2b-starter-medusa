/**
 * 📊 Dimensionamento Card
 */

'use client';

import React from 'react';
import { getHelioTooltip } from '@/lib/copy/helio';
import type { Dimensionamento } from '@/types/solar-calculator';

interface DimensionamentoCardProps {
    dimensionamento: Dimensionamento;
}

export function DimensionamentoCard({ dimensionamento }: DimensionamentoCardProps) {
    const {
        kwp_proposto,
        numero_paineis,
        potencia_inversor_kw,
        area_necessaria_m2,
        geracao_anual_kwh,
        performance_ratio,
        oversizing_ratio,
    } = dimensionamento;

    const geracaoMensal = geracao_anual_kwh / 12;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                Dimensionamento Técnico
            </h3>

            <div className="space-y-4">
                {/* Potência do Sistema */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium" title={getHelioTooltip('stc')}>Potência do Sistema</span>
                        <span className="text-3xl font-bold text-yellow-600">
                            {kwp_proposto.toFixed(2)} kWp
                        </span>
                    </div>
                </div>

                {/* Grid de Especificações */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600 mb-1">Painéis Solares</div>
                        <div className="text-lg font-bold text-gray-900">{numero_paineis} unidades</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600 mb-1" title={getHelioTooltip('mppt')}>Inversor</div>
                        <div className="text-lg font-bold text-gray-900">{potencia_inversor_kw.toFixed(1)} kW</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600 mb-1">Área Necessária</div>
                        <div className="text-lg font-bold text-gray-900">{area_necessaria_m2.toFixed(1)} m²</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600 mb-1" title={getHelioTooltip('pr')}>Performance Ratio</div>
                        <div className="text-lg font-bold text-gray-900">{(performance_ratio * 100).toFixed(0)}%</div>
                    </div>
                </div>

                {/* Geração de Energia */}
                <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">📈 Geração Estimada</h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Mensal (média)</span>
                            <span className="font-bold text-green-600">{geracaoMensal.toFixed(0)} kWh</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Anual</span>
                            <span className="font-bold text-green-600">{geracao_anual_kwh.toFixed(0)} kWh</span>
                        </div>
                    </div>
                </div>

                {/* Oversizing Badge */}
                {oversizing_ratio > 1 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                        <span className="text-blue-800">
                            ✨ Sistema com oversizing de <strong>{((oversizing_ratio - 1) * 100).toFixed(0)}%</strong> para compensar perdas
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

