/**
 * 📊 Dashboard de KPIs Financeiros por Persona
 * Componente interativo para visualização de ROI, Payback, LCOE e comparações
 */

'use client'

import { useState, useEffect } from 'react'
import type {
  PersonaID,
  PersonaFinancialKPIs,
  LeaderboardByPersona,
  RegionalFinancialAnalysis,
} from '@/lib/types/bacen-realtime'

interface PersonaFinancialDashboardProps {
  readonly personaId: PersonaID
  readonly initialData?: PersonaFinancialKPIs
  readonly showComparison?: boolean
  readonly showLeaderboard?: boolean
}

export function PersonaFinancialDashboard({
  personaId,
  initialData,
  showComparison = true,
  showLeaderboard = true,
}: PersonaFinancialDashboardProps) {
  const [kpis, setKpis] = useState<PersonaFinancialKPIs | null>(initialData ?? null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardByPersona | null>(null)
  const [regional, setRegional] = useState<RegionalFinancialAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'kpis' | 'leaderboard' | 'regional'>('kpis')

  useEffect(() => {
    if (!initialData) {
      loadKPIs()
    }
  }, [personaId])

  const loadKPIs = async () => {
    setLoading(true)
    try {
      // TODO: Chamar API real
      // const response = await fetch('/api/bacen/kpis/persona', {
      //   method: 'POST',
      //   body: JSON.stringify({ persona_id: personaId, ... })
      // })
      console.log('Loading KPIs for:', personaId)
    } catch (error) {
      console.error('Error loading KPIs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!kpis) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Nenhum dado disponível. Configure os parâmetros da análise.</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header com Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('kpis')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'kpis'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            KPIs Financeiros
          </button>
          {showLeaderboard && (
            <button
              onClick={() => setSelectedTab('leaderboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'leaderboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rankings de Equipamentos
            </button>
          )}
          {showComparison && (
            <button
              onClick={() => setSelectedTab('regional')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'regional'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Análise Regional
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      {selectedTab === 'kpis' && <KPIsView kpis={kpis} />}
      {selectedTab === 'leaderboard' && leaderboard && <LeaderboardView data={leaderboard} />}
      {selectedTab === 'regional' && regional && <RegionalView data={regional} />}
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTES
// ============================================================================

function KPIsView({ kpis }: { kpis: PersonaFinancialKPIs }) {
  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Payback Simples"
          value={`${kpis.roi.paybackSimples.toFixed(1)} anos`}
          subtitle="Retorno do investimento"
          trend={kpis.roi.paybackSimples < 5 ? 'positive' : 'neutral'}
        />
        <MetricCard
          title="TIR"
          value={`${kpis.roi.tir.toFixed(1)}%`}
          subtitle="Taxa Interna de Retorno"
          trend={kpis.roi.tir > 15 ? 'positive' : 'neutral'}
        />
        <MetricCard
          title="VPL"
          value={`R$ ${kpis.roi.vpl.toLocaleString('pt-BR')}`}
          subtitle="Valor Presente Líquido"
          trend={kpis.roi.vpl > 0 ? 'positive' : 'negative'}
        />
      </div>

      {/* LCOE e Economia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">LCOE - Custo Nivelado de Energia</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Custo/kWh (25 anos):</span>
              <span className="font-bold text-2xl text-blue-600">
                R$ {kpis.roi.lcoe.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">vs Tarifa atual:</span>
              <span className="text-green-600">
                {(((kpis.tarifaKWh - kpis.roi.lcoe) / kpis.tarifaKWh) * 100).toFixed(0)}% menor
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Economia Projetada</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Mensal:</span>
              <span className="font-semibold">
                R$ {kpis.economia.mensal.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Anual:</span>
              <span className="font-semibold">
                R$ {kpis.economia.anual.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">25 anos:</span>
              <span className="font-bold text-green-600">
                R$ {kpis.economia.total25anos.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Riscos Regulatórios */}
      {kpis.regimeGD === 'GD II' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">⚠️</span>
            Riscos Regulatórios - Escalonamento TUSD Fio B
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Lei 14.300/2022 prevê escalonamento gradual da TUSD Fio B até 2028:
            </p>
            <div className="grid grid-cols-6 gap-2 text-center text-sm">
              {kpis.riscos.escalonamentoTUSD.map((perc, i) => (
                <div key={i} className="bg-white rounded p-2">
                  <div className="text-gray-500">{2023 + i}</div>
                  <div className="font-bold">{(perc * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Impacto acumulado:{' '}
              <span className="font-semibold">
                R$ {kpis.riscos.impactoEscalonamento.toLocaleString('pt-BR')}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Financiamento */}
      {kpis.financiamento && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Detalhes do Financiamento</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 block text-sm">Modalidade</span>
              <span className="font-semibold">{kpis.financiamento.modalidade}</span>
            </div>
            <div>
              <span className="text-gray-600 block text-sm">Taxa ao mês</span>
              <span className="font-semibold">{kpis.financiamento.taxaMensal.toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-gray-600 block text-sm">Parcela mensal</span>
              <span className="font-semibold">
                R$ {kpis.financiamento.parcelaMensal.toLocaleString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="text-gray-600 block text-sm">Economia líquida/mês</span>
              <span
                className={`font-semibold ${kpis.financiamento.economiaLiquida > 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                R$ {kpis.financiamento.economiaLiquida.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LeaderboardView({ data }: { data: LeaderboardByPersona }) {
  const [selectedRanking, setSelectedRanking] = useState<
    'lcoe' | 'roi' | 'payback' | 'score'
  >('score')

  const rankings = {
    lcoe: data.topPorLCOE,
    roi: data.topPorROI,
    payback: data.topPorPayback,
    score: data.topPorScore,
  }

  const currentRanking = rankings[selectedRanking]

  return (
    <div className="space-y-6">
      {/* Selector de Ranking */}
      <div className="flex space-x-4">
        {['score', 'lcoe', 'roi', 'payback'].map(type => (
          <button
            key={type}
            onClick={() => setSelectedRanking(type as typeof selectedRanking)}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedRanking === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'score' && '🏆 Score Geral'}
            {type === 'lcoe' && '💰 Menor LCOE'}
            {type === 'roi' && '📈 Maior ROI'}
            {type === 'payback' && '⚡ Menor Payback'}
          </button>
        ))}
      </div>

      {/* Lista de Equipamentos */}
      <div className="space-y-3">
        {currentRanking.map((eq, index) => (
          <div
            key={`${eq.fabricante}-${eq.modelo}`}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-300'
                  }`}
                >
                  #{index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-lg">
                    {eq.fabricante} - {eq.modelo}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {eq.tecnologia} • {eq.potenciaWp}Wp • Tier {eq.tier}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedRanking === 'lcoe' && `R$ ${eq.kpis.lcoeNormalizado.toFixed(2)}`}
                  {selectedRanking === 'roi' && `${eq.kpis.roi25anos.toFixed(0)}%`}
                  {selectedRanking === 'payback' && `${eq.kpis.paybackEquipamento.toFixed(1)}a`}
                  {selectedRanking === 'score' && `${eq.scores.geral.toFixed(0)}/100`}
                </div>
                <div className="text-sm text-gray-500">
                  R$ {eq.precoUnitario.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RegionalView({ data }: { data: RegionalFinancialAnalysis }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📍 {data.localidade}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">HSP Diário Médio:</span>
            <span className="ml-2 font-semibold">{data.radiacaoMedia.hspDiario.toFixed(2)} h</span>
          </div>
          <div>
            <span className="text-gray-600">Fonte de Dados:</span>
            <span className="ml-2 font-semibold">{data.radiacaoMedia.fonte}</span>
          </div>
          <div>
            <span className="text-gray-600">Tarifa Total:</span>
            <span className="ml-2 font-semibold">
              R$ {data.tarifas.tarifaTotal.toFixed(2)}/kWh
            </span>
          </div>
          <div>
            <span className="text-gray-600">Distribuidora:</span>
            <span className="ml-2 font-semibold">{data.distribuidora}</span>
          </div>
        </div>
      </div>

      {/* Recomendação */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold mb-2">✅ Recomendação</h4>
        <p className="text-sm text-gray-700 mb-3">{data.recomendacao.motivacao}</p>
        {data.recomendacao.alertas.length > 0 && (
          <div className="space-y-1">
            {data.recomendacao.alertas.map((alerta, i) => (
              <p key={i} className="text-sm text-gray-600">
                {alerta}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
  trend,
}: {
  title: string
  value: string
  subtitle: string
  trend: 'positive' | 'negative' | 'neutral'
}) {
  const trendColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className={`text-3xl font-bold ${trendColors[trend]}`}>{value}</div>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  )
}
