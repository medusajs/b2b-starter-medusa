/**
 * 🌞 Solar Calculation Results - Main Component
 * Exibe resultados completos do cálculo solar
 */

'use client';

import React from 'react';
import type { SolarCalculationOutput } from '@/types/solar-calculator';
import { DimensionamentoCard } from './dimensionamento-card';
import { FinanceiroCard } from './financeiro-card';
import { KitsRecomendadosCard } from './kits-recomendados-card';
import { ImpactoAmbientalCard } from './impacto-ambiental-card';
import { ConformidadeCard } from './conformidade-card';

interface SolarResultsProps {
    calculation: SolarCalculationOutput;
    onKitSelect?: (kitId: string) => void;
    onRecalculate?: () => void;
}

export function SolarResults({
    calculation,
    onKitSelect,
    onRecalculate,
}: SolarResultsProps) {
    const {
        dimensionamento,
        kits_recomendados,
        financeiro,
        impacto_ambiental,
        conformidade,
        dados_localizacao,
    } = calculation;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            ☀️ Seu Sistema Solar Fotovoltaico
                        </h2>
                        <p className="text-gray-600">
                            Sistema dimensionado para{' '}
                            <span className="font-semibold text-yellow-600">
                                {dados_localizacao.estado}
                            </span>{' '}
                            com irradiância média de{' '}
                            <span className="font-semibold">{dados_localizacao.hsp} kWh/m²/dia</span>
                        </p>
                    </div>
                    {onRecalculate && (
                        <button
                            onClick={onRecalculate}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            🔄 Recalcular
                        </button>
                    )}
                </div>
            </div>

            {/* Conformidade MMGD (se houver alertas) */}
            {!conformidade.conforme && (
                <ConformidadeCard conformidade={conformidade} />
            )}

            {/* Grid de Cards Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dimensionamento Técnico */}
                <DimensionamentoCard dimensionamento={dimensionamento} />

                {/* Análise Financeira */}
                <FinanceiroCard financeiro={financeiro} />
            </div>

            {/* Kits Recomendados */}
            <KitsRecomendadosCard
                kits={kits_recomendados}
                onKitSelect={onKitSelect}
            />

            {/* Impacto Ambiental */}
            <ImpactoAmbientalCard impacto={impacto_ambiental} />

            {/* Observações Finais */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informações Importantes</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Valores estimados com base em média de irradiância solar da região</li>
                    <li>• Geração pode variar conforme condições climáticas e sombreamento</li>
                    <li>• Preços sujeitos a alteração - consulte disponibilidade atualizada</li>
                    <li>• Instalação deve ser feita por profissional qualificado</li>
                    <li>• Sistema deve ser homologado pela distribuidora de energia</li>
                </ul>
            </div>
        </div>
    );
}
