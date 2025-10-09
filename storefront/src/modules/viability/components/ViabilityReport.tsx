/**
 * Viability Report Component
 * Relatório completo de viabilidade (PDF/HTML)
 */

'use client'

import React from 'react'
import { toast } from '@medusajs/ui'
import { useViability } from '../context/ViabilityContext'

export default function ViabilityReport() {
    const { output, roofData, energyEstimate, isCalculating } = useViability()

    if (isCalculating) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-amber-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-neutral-600">Calculando viabilidade...</p>
                </div>
            </div>
        )
    }

    if (!output || !roofData || !energyEstimate) {
        return (
            <div className="text-center p-12 bg-neutral-50 rounded-lg">
                <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-neutral-600 mb-2">Nenhum cálculo realizado ainda</p>
                <p className="text-sm text-neutral-500">Preencha os dados acima e clique em &quot;Calcular Viabilidade&quot;</p>
            </div>
        )
    }

    const handleDownloadPDF = async () => {
        // Implementar geração de PDF
        toast.info('Funcionalidade de PDF em desenvolvimento', {
            duration: 3000,
        })
        console.log('Gerando PDF...')
    }

    const handleShareReport = async () => {
        // Implementar compartilhamento
        toast.info('Funcionalidade de compartilhamento em desenvolvimento', {
            duration: 3000,
        })
        console.log('Compartilhando relatório...')
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-amber-200">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-neutral-900">Relatório de Viabilidade</h3>
                    <p className="text-sm text-neutral-600">Sistema Fotovoltaico {output.proposal_kwp} kWp</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadPDF}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Baixar PDF
                    </button>
                    <button
                        onClick={handleShareReport}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Compartilhar
                    </button>
                </div>
            </div>

            <div className="prose max-w-none">
                <p className="text-neutral-700 mb-6">
                    Este relatório apresenta a análise completa de viabilidade técnica para instalação de um sistema
                    fotovoltaico, considerando dados de irradiância solar local, características do telhado e estimativas
                    de geração de energia.
                </p>

                {output.attachments && output.attachments.length > 0 && (
                    <div className="not-prose mt-6">
                        <h4 className="font-semibold text-neutral-900 mb-3">Anexos</h4>
                        <div className="space-y-2">
                            {output.attachments.map((attachment, idx) => (
                                <a
                                    key={idx}
                                    href={attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    <span className="text-sm text-neutral-700">{attachment.split('/').pop()}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
