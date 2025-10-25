/**
 * 🌞 Solar Calculation Results - Main Component
 * Exibe resultados completos do cálculo solar
 */

'use client';

import React, { useEffect } from 'react';
import type { SolarCalculationOutput } from '@/types/solar-calculator';
import { DimensionamentoCard } from './dimensionamento-card';
import { FinanceiroCard } from './financeiro-card';
import { KitsRecomendadosCard } from './kits-recomendados-card';
import { ImpactoAmbientalCard } from './impacto-ambiental-card';
import { ConformidadeCard } from './conformidade-card';
import { toast } from '@medusajs/ui';
import { getHelioText, getHelioTooltip } from '@/lib/copy/helio';
import LocalizedClientLink from "@/modules/common/components/localized-client-link";
import { sendEvent } from '@/modules/common/analytics/events';

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

    // Hélio — banner/aviso de simulação pronta
    useEffect(() => {
        try {
            const msg = getHelioText('resultados_resumo', 'simulacao_pronta') || 'Simulação pronta.'
            toast.info(msg)
        } catch { }
        // run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            ☀️ Seu Sistema Solar Fotovoltaico
                        </h2>
                        <p className="text-gray-600" title={getHelioTooltip('modelchain')}>
                            Sistema dimensionado para{' '}
                            <span className="font-semibold text-yellow-600">
                                {dados_localizacao.estado}
                            </span>{' '}
                            com irradiância média de{' '}
                            <span className="font-semibold">{dados_localizacao.hsp} kWh/m²/dia</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mr-2">
                        <LocalizedClientLink
                            href={`/tarifas?uf=${encodeURIComponent(dados_localizacao.estado || '')}&hsp=${encodeURIComponent(String(dados_localizacao.hsp || ''))}&tarifa=${encodeURIComponent(String(dados_localizacao.tarifa_kwh || ''))}`}
                            className="ysh-btn-outline"
                            title={getHelioTooltip('nasa_power')}
                            onClick={() => sendEvent('cta_validate_tariff_clicked', { from: 'solar_results' })}
                        >
                            Validar tarifa
                        </LocalizedClientLink>
                        <LocalizedClientLink
                            href={`/cotacao?source=solar_results&data=${encodeURIComponent(JSON.stringify({
                                system_kwp: dimensionamento.kwp_proposto,
                                expected_generation_kwh_year: dimensionamento.geracao_anual_kwh,
                                performance_ratio: dimensionamento.performance_ratio,
                                oversizing_ratio: dimensionamento.oversizing_ratio,
                                inverter_kw: dimensionamento.potencia_inversor_kw,
                                panels_count: dimensionamento.numero_paineis,
                                area_m2: dimensionamento.area_necessaria_m2,
                                location: { estado: dados_localizacao.estado, hsp: dados_localizacao.hsp, tarifa_kwh: dados_localizacao.tarifa_kwh },
                                finance: financeiro ? { capex_total_brl: financeiro.capex.total_brl, economy_month_brl: financeiro.economia.mensal_brl, payback_anos: financeiro.retorno.payback_simples_anos } : undefined,
                            }))}`}
                            className="ysh-btn-primary"
                            onClick={() => sendEvent('cta_generate_proposal_clicked', { from: 'solar_results' })}
                        >
                            Gerar proposta
                        </LocalizedClientLink>
                        <LocalizedClientLink
                            href={`/proposta/printable?data=${encodeURIComponent(JSON.stringify({
                                system_kwp: dimensionamento.kwp_proposto,
                                expected_generation_kwh_year: dimensionamento.geracao_anual_kwh,
                                performance_ratio: dimensionamento.performance_ratio,
                                oversizing_ratio: dimensionamento.oversizing_ratio,
                                inverter_kw: dimensionamento.potencia_inversor_kw,
                                panels_count: dimensionamento.numero_paineis,
                                area_m2: dimensionamento.area_necessaria_m2,
                                location: { estado: dados_localizacao.estado, hsp: dados_localizacao.hsp, tarifa_kwh: dados_localizacao.tarifa_kwh },
                                finance: financeiro ? { capex_total_brl: financeiro.capex.total_brl, economy_month_brl: financeiro.economia.mensal_brl, payback_anos: financeiro.retorno.payback_simples_anos } : undefined,
                            }))}`}
                            className="ysh-btn-secondary"
                            onClick={() => sendEvent('cta_download_pdf_clicked', { from: 'solar_results' })}
                        >
                            Baixar PDF
                        </LocalizedClientLink>
                    </div>
                    {onRecalculate && (
                        <button
                            onClick={onRecalculate}
                            className="ysh-btn-outline"
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





