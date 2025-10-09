// @ts-nocheck - Legacy file, types need major update
'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, XCircle, FileText, Download, Upload } from 'lucide-react'
import { ComplianceInput, ComplianceReport, ClasseTarifaria, ModalidadeMMGD } from '@/modules/compliance/types'
import { validateProdist } from '@/modules/compliance/validators/prodist'
import { gerarChecklistANEEL } from '@/modules/compliance/generators/checklist'
import { getDistribuidora, getAllDistribuidoras } from '@/modules/compliance/data/distribuidoras'

export default function ComplianceWrapper() {
    const [step, setStep] = useState<'input' | 'result'>('input')
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState<ComplianceReport | null>(null)

    // Form state
    // @ts-ignore - Types need update
    const [formData, setFormData] = useState<ComplianceInput>({
        potencia_instalada_kwp: 5.0,
        tensao_conexao_kv: 0.22,
        tipo_conexao: 'bifasico' as const,
        distribuidora: 'CEMIG',
        uf: 'MG',
        consumo_anual_kwh: 4200,
        classe_tarifaria: 'B1' as const,
        modalidade_mmgd: 'microgeracao_junto_a_carga' as const,
    })

    const distribuidoras = getAllDistribuidoras()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call
        setTimeout(() => {
            // Run validation
            const validacao = validateProdist(formData)
            const checklist = gerarChecklistANEEL(formData)
            const distribuidora_info = getDistribuidora(formData.distribuidora)

            if (!distribuidora_info) {
                alert('Distribuidora não encontrada')
                setLoading(false)
                return
            }

            const newReport: ComplianceReport = {
                input: formData,
                validacao,
                checklist,
                distribuidora_info,
                resumo: {
                    status_geral: validacao.is_compliant ? 'aprovado' : 'reprovado',
                    pode_prosseguir: validacao.is_compliant,
                    proximos_passos: validacao.is_compliant
                        ? [
                            'Preparar documentos do checklist',
                            'Preencher formulário da distribuidora',
                            'Anexar projeto elétrico e ART',
                            'Enviar dossiê técnico via portal',
                            `Aguardar análise (${distribuidora_info.prazo_analise_micro_du} dias úteis)`
                        ]
                        : [
                            'Corrigir problemas identificados',
                            'Redimensionar sistema se necessário',
                            'Revisar projeto elétrico',
                            'Consultar engenheiro responsável'
                        ]
                }
            }

            setReport(newReport)
            setStep('result')
            setLoading(false)
        }, 1500)
    }

    const handleReset = () => {
        setStep('input')
        setReport(null)
    }

    if (step === 'result' && report) {
        return (
            <div className="content-container py-12">
                {/* Status Header */}
                <div className={`rounded-xl p-8 mb-8 ${report.resumo.status_geral === 'aprovado'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                    }`}>
                    <div className="flex items-start">
                        {report.resumo.status_geral === 'aprovado' ? (
                            <CheckCircle className="w-12 h-12 text-green-600 mr-4 flex-shrink-0" />
                        ) : (
                            <XCircle className="w-12 h-12 text-red-600 mr-4 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                            <h2 className={`text-3xl font-bold mb-2 ${report.resumo.status_geral === 'aprovado' ? 'text-green-600' : 'text-red-600'}`}>
                                {report.resumo.status_geral === 'aprovado' ? 'Sistema Aprovado! ✅' : 'Sistema Reprovado ❌'}
                            </h2>
                            <p className={report.resumo.status_geral === 'aprovado' ? 'text-green-800' : 'text-red-800'}>
                                {report.resumo.status_geral === 'aprovado'
                                    ? 'Seu sistema está em conformidade com PRODIST e pode prosseguir para homologação.'
                                    : 'Foram identificados problemas que precisam ser corrigidos antes da homologação.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Validation Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* PRODIST Validation */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-[var(--border)]">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Validação PRODIST</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700">Nível de Tensão</span>
                                {report.validacao.nivel_tensao_correto ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700">Potência</span>
                                {report.validacao.potencia_dentro_limites ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700">Oversizing</span>
                                {report.validacao.oversizing_valido ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700">Modalidade MMGD</span>
                                {report.validacao.modalidade_permitida ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                            </div>
                        </div>

                        {/* Limites */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3">Limites Aplicáveis</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Potência máxima:</span>
                                    <span className="font-medium">{report.validacao.limites.potencia_maxima_kwp} kWp</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Oversizing máximo:</span>
                                    <span className="font-medium">{report.validacao.limites.oversizing_maximo_percent}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tensão:</span>
                                    <span className="font-medium">{report.validacao.limites.tensao_minima_kv} - {report.validacao.limites.tensao_maxima_kv} kV</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Checklist Progress */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-[var(--border)]">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Progresso do Checklist</h3>
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Documentos Completos</span>
                                <span className="font-semibold">{report.checklist.progresso.percent_completo}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden relative">
                                <div
                                    className="absolute inset-y-0 left-0 bg-green-600 rounded-full transition-all duration-500"
                                    data-progress={Math.min(100, Math.max(0, report.checklist.progresso.percent_completo))}
                                    style={{ width: `${Math.min(100, Math.max(0, report.checklist.progresso.percent_completo))}%` } as React.CSSProperties}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-700">Total de Itens</span>
                                <span className="font-bold text-gray-900">{report.checklist.progresso.total}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <span className="text-green-700">Concluídos</span>
                                <span className="font-bold text-green-600">{report.checklist.progresso.concluidos}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <span className="text-red-700">Obrigatórios Pendentes</span>
                                <span className="font-bold text-red-600">{report.checklist.progresso.obrigatorios_pendentes}</span>
                            </div>
                        </div>

                        {/* Distribuidora Info */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2">Distribuidora</h4>
                            <p className="text-gray-700 font-medium mb-1">{report.distribuidora_info.razao_social}</p>
                            <p className="text-sm text-gray-600 mb-3">{report.distribuidora_info.uf.join(', ')}</p>
                            <a
                                href={report.distribuidora_info.portal_acesso_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                            >
                                Acessar Portal →
                            </a>
                        </div>
                    </div>
                </div>

                {/* Errors */}
                {report.validacao.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                        <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
                            <XCircle className="w-6 h-6 mr-2" />
                            Erros Críticos ({report.validacao.errors.length})
                        </h3>
                        <ul className="space-y-2">
                            {report.validacao.errors.map((error, idx) => (
                                <li key={idx} className="text-red-800 flex items-start">
                                    <span className="text-red-600 mr-2 mt-1">●</span>
                                    <span>{error}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Warnings */}
                {report.validacao.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                        <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center">
                            <AlertCircle className="w-6 h-6 mr-2" />
                            Avisos ({report.validacao.warnings.length})
                        </h3>
                        <ul className="space-y-2">
                            {report.validacao.warnings.map((warning, idx) => (
                                <li key={idx} className="text-yellow-800 flex items-start">
                                    <span className="text-yellow-600 mr-2 mt-1">●</span>
                                    <span>{warning}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Next Steps */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Próximos Passos</h3>
                    <ol className="space-y-2">
                        {report.resumo.proximos_passos.map((step, idx) => (
                            <li key={idx} className="text-blue-800 flex items-start">
                                <span className="font-bold mr-3">{idx + 1}.</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleReset}
                        className="ysh-btn-secondary"
                    >
                        Nova Validação
                    </button>
                    <button className="ysh-btn-primary flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Relatório PDF
                    </button>
                    <button className="ysh-btn-primary flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Gerar Dossiê Técnico
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="content-container py-12">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-[var(--border)]">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Dados do Sistema
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Potência */}
                        <div>
                            <label htmlFor="potencia" className="block text-sm font-medium text-gray-700 mb-2">
                                Potência Instalada (kWp) *
                            </label>
                            <input
                                id="potencia"
                                type="number"
                                step="0.01"
                                required
                                placeholder="Ex: 5.0"
                                value={formData.potencia_instalada_kwp}
                                onChange={(e) => setFormData({ ...formData, potencia_instalada_kwp: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-transparent"
                            />
                        </div>

                        {/* Consumo Anual */}
                        <div>
                            <label htmlFor="consumo" className="block text-sm font-medium text-gray-700 mb-2">
                                Consumo Anual (kWh) *
                            </label>
                            <input
                                id="consumo"
                                type="number"
                                required
                                placeholder="Ex: 4200"
                                value={formData.consumo_anual_kwh}
                                onChange={(e) => setFormData({ ...formData, consumo_anual_kwh: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-transparent"
                            />
                        </div>

                        {/* Classe Tarifária */}
                        <div>
                            <label htmlFor="classe" className="block text-sm font-medium text-gray-700 mb-2">
                                Classe Tarifária *
                            </label>
                            <select
                                id="classe"
                                required
                                value={formData.classe_tarifaria}
                                onChange={(e) => setFormData({ ...formData, classe_tarifaria: e.target.value as ClasseTarifaria })}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-transparent"
                            >
                                <option value="B1">B1 - Residencial</option>
                                <option value="B2">B2 - Rural</option>
                                <option value="B3">B3 - Comercial/Industrial BT</option>
                                <option value="A4">A4 - Média Tensão (2,3-25 kV)</option>
                                <option value="A3">A3 - Média Tensão (30-44 kV)</option>
                                <option value="A3a">A3a - Média Tensão (30-44 kV)</option>
                                <option value="A2">A2 - Alta Tensão (88-138 kV)</option>
                                <option value="A1">A1 - Alta Tensão (≥230 kV)</option>
                            </select>
                        </div>

                        {/* Tensão */}
                        <div>
                            <label htmlFor="tensao" className="block text-sm font-medium text-gray-700 mb-2">
                                Tensão de Conexão (kV) *
                            </label>
                            <select
                                id="tensao"
                                required
                                value={formData.tensao_conexao_kv}
                                onChange={(e) => setFormData({ ...formData, tensao_conexao_kv: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-transparent"
                            >
                                <option value="0.127">127V (monofásico)</option>
                                <option value="0.22">220V (bifásico/trifásico)</option>
                                <option value="0.38">380V (trifásico)</option>
                                <option value="13.8">13,8 kV (média tensão)</option>
                                <option value="23">23 kV (média tensão)</option>
                                <option value="34.5">34,5 kV (média tensão)</option>
                                <option value="69">69 kV (alta tensão)</option>
                                <option value="138">138 kV (alta tensão)</option>
                            </select>
                        </div>

                        {/* Tipo Conexão */}
                        <div>
                            <label htmlFor="tipo-conexao" className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Conexão *
                            </label>
                            <select
                                id="tipo-conexao"
                                required
                                value={formData.tipo_conexao}
                                onChange={(e) => setFormData({ ...formData, tipo_conexao: e.target.value as any })}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-transparent"
                            >
                                <option value="monofasico">Monofásico (2 fios)</option>
                                <option value="bifasico">Bifásico (3 fios)</option>
                                <option value="trifasico">Trifásico (4 fios)</option>
                            </select>
                        </div>

                        {/* Distribuidora */}
                        <div>
                            <label htmlFor="distribuidora" className="block text-sm font-medium text-gray-700 mb-2">
                                Distribuidora *
                            </label>
                            <select
                                id="distribuidora"
                                required
                                value={formData.distribuidora}
                                onChange={(e) => {
                                    const dist = getDistribuidora(e.target.value)
                                    setFormData({
                                        ...formData,
                                        distribuidora: e.target.value,
                                        uf: dist?.uf[0] || formData.uf
                                    })
                                }}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-transparent"
                            >
                                {distribuidoras.map(dist => (
                                    <option key={dist.codigo} value={dist.codigo}>
                                        {dist.nome} - {dist.uf.join(', ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Modalidade MMGD */}
                        <div className="md:col-span-2">
                            <label htmlFor="modalidade" className="block text-sm font-medium text-gray-700 mb-2">
                                Modalidade MMGD *
                            </label>
                            <select
                                id="modalidade"
                                required
                                value={formData.modalidade_mmgd}
                                onChange={(e) => setFormData({ ...formData, modalidade_mmgd: e.target.value as ModalidadeMMGD })}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-transparent"
                            >
                                <option value="microgeracao_junto_a_carga">Microgeração junto à carga</option>
                                <option value="minigeracao_junto_a_carga">Minigeração junto à carga</option>
                                <option value="autoconsumo_remoto">Autoconsumo remoto</option>
                                <option value="geracao_compartilhada">Geração compartilhada</option>
                                <option value="multiplas_unidades_consumidoras">Múltiplas unidades consumidoras</option>
                                <option value="empreendimento_multiplas_unidades">Empreendimento de múltiplas unidades</option>
                            </select>
                            <p className="text-sm text-gray-500 mt-2">
                                Escolha a modalidade de acordo com a REN 687/2015 e REN 1.059/2023
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="ysh-btn-primary px-8 py-3 disabled:opacity-50"
                        >
                            {loading ? 'Validando...' : 'Validar Compliance'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
