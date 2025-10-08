/**
 * MMGD Validator Component
 * Validação de elegibilidade para micro/minigeração distribuída
 */

'use client'

import React from 'react'
import { useTariff } from '../context/TariffContext'

export default function MMGDValidator() {
  const { mmgdPacket } = useTariff()

  if (!mmgdPacket) return null

  const { eligibility } = mmgdPacket

  const modalidadeLabels: Record<string, string> = {
    microgeracao_junto_a_carga: 'Microgeração Junto à Carga',
    minigeracao_junto_a_carga: 'Minigeração Junto à Carga',
    autoconsumo_remoto: 'Autoconsumo Remoto',
    geracao_compartilhada: 'Geração Compartilhada',
    multiplas_unidades_consumidoras: 'Múltiplas Unidades Consumidoras',
    empreendimento_multiplas_unidades: 'Empreendimento de Múltiplas Unidades',
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-lg border-2 ${eligibility.is_eligible ? 'border-green-300' : 'border-red-300'}`}>
      <div className="flex items-center gap-3 mb-4">
        {eligibility.is_eligible ? (
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ) : (
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-neutral-900">
            {eligibility.is_eligible ? 'Elegível para MMGD' : 'Não Elegível para MMGD'}
          </h3>
          <p className="text-sm text-neutral-600">Modalidade de Micro/Minigeração Distribuída</p>
        </div>
      </div>

      {/* MMGD Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 mb-1">Classe</p>
          <p className="text-2xl font-bold text-blue-900">{mmgdPacket.IdcClasse}</p>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-purple-600 mb-1">Subgrupo</p>
          <p className="text-2xl font-bold text-purple-900">{mmgdPacket.IdcSubgrupo}</p>
        </div>

        <div className="col-span-2 p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-600 mb-1">Modalidade</p>
          <p className="text-lg font-semibold text-green-900">
            {modalidadeLabels[mmgdPacket.IdcModalidade] || mmgdPacket.IdcModalidade}
          </p>
        </div>
      </div>

      <div className="p-4 bg-amber-50 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-amber-700">Potência Instalada</span>
          <span className="text-2xl font-bold text-amber-900">{mmgdPacket.MdaPotenciaInstalada} kWp</span>
        </div>
      </div>

      {/* Reasons */}
      {eligibility.reasons.length > 0 && (
        <div className={`p-4 rounded-lg mb-4 ${eligibility.is_eligible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h4 className={`font-semibold mb-2 ${eligibility.is_eligible ? 'text-green-900' : 'text-red-900'}`}>
            {eligibility.is_eligible ? '✓ Motivos de Elegibilidade' : '✗ Motivos de Inelegibilidade'}
          </h4>
          <ul className="space-y-1">
            {eligibility.reasons.map((reason, idx) => (
              <li key={idx} className={`text-sm ${eligibility.is_eligible ? 'text-green-700' : 'text-red-700'}`}>
                • {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Restrictions */}
      {eligibility.restrictions && eligibility.restrictions.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Restrições</h4>
          <ul className="space-y-1">
            {eligibility.restrictions.map((restriction, idx) => (
              <li key={idx} className="text-sm text-yellow-800">
                • {restriction}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CSV Link */}
      {mmgdPacket.CSV && (
        <div className="mt-4">
          <a
            href={mmgdPacket.CSV}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Baixar Dados CSV
          </a>
        </div>
      )}
    </div>
  )
}
