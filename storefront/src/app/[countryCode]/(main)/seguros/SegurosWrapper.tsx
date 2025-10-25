'use client'

import { useState } from 'react'
import { Shield, Award, TrendingDown, CheckCircle, Star, Phone, Mail, ExternalLink, Download } from 'lucide-react'
import { SeguroInput, ComparacaoSeguros, TipoCobertura } from '@/modules/seguros/types'
import { cotarSeguros } from '@/modules/financing/insurance/seguros/calculator/cotador'
import { CustomerGroup } from '@/lib/context/sales-channel-context'

export default function SegurosWrapper() {
    const [step, setStep] = useState<'input' | 'result'>('input')
    const [loading, setLoading] = useState(false)
    const [comparacao, setComparacao] = useState<ComparacaoSeguros | null>(null)

    // Form state
    const [formData, setFormData] = useState<SeguroInput>({
        potencia_kwp: 5.0,
        valor_equipamento: 25000,
        tipo_instalacao: 'telhado',
        customer_group: 'residencial-b1',
        cep: '30110-000',
        uf: 'MG',
        coberturas_desejadas: ['equipamento', 'rc', 'fenomenos_naturais'],
        possui_monitoramento: false,
        possui_manutencao_preventiva: false,
        sistema_off_grid: false,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call
        setTimeout(() => {
            const result = cotarSeguros(formData)
            setComparacao(result)
            setStep('result')
            setLoading(false)
        }, 1500)
    }

    const handleReset = () => {
        setStep('input')
        setComparacao(null)
    }

    const toggleCobertura = (cobertura: TipoCobertura) => {
        const coberturas = [...formData.coberturas_desejadas]
        const index = coberturas.indexOf(cobertura)

        if (index > -1) {
            if (cobertura !== 'equipamento') { // Equipamento é obrigatório
                coberturas.splice(index, 1)
            }
        } else {
            coberturas.push(cobertura)
        }

        setFormData({ ...formData, coberturas_desejadas: coberturas })
    }

    if (step === 'result' && comparacao) {
        return (
            <div className="content-container py-12">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8 border border-green-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {comparacao.cotacoes.length} Cotações Encontradas
                    </h2>
                    <p className="text-gray-700">
                        Economize até <span className="font-bold text-green-600">
                            R$ {comparacao.economia_maxima.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span> por ano escolhendo a melhor opção
                    </p>
                </div>

                {/* Cotações Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {comparacao.cotacoes.map((cotacao, idx) => (
                        <div
                            key={cotacao.seguradora.codigo}
                            className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all ${cotacao === comparacao.recomendacao
                                ? 'border-green-500 ring-2 ring-green-200'
                                : 'border-[var(--border)] hover:border-blue-300'
                                }`}
                        >
                            {/* Badge */}
                            {cotacao.destaque && (
                                <div className="mb-4">
                                    {cotacao.destaque === 'melhor_preco' && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <TrendingDown className="w-4 h-4 mr-1" />
                                            Melhor Preço
                                        </span>
                                    )}
                                    {cotacao.destaque === 'maior_cobertura' && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            <Shield className="w-4 h-4 mr-1" />
                                            Maior Cobertura
                                        </span>
                                    )}
                                    {cotacao.destaque === 'mais_vendido' && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                            <Award className="w-4 h-4 mr-1" />
                                            Mais Recomendado
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {cotacao.seguradora.nome}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                        <span className="font-semibold">{cotacao.seguradora.nota_rating}/10</span>
                                        <span className="mx-2">•</span>
                                        <span>{cotacao.seguradora.tempo_mercado_anos} anos</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-gray-900">
                                        R$ {cotacao.premio_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-sm text-gray-600">/mês</div>
                                </div>
                            </div>

                            {/* Annual Price */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Prêmio anual:</span>
                                    <span className="font-semibold text-gray-900">
                                        R$ {cotacao.premio_anual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                {cotacao.desconto_percent && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <div className="flex items-center text-sm text-green-600">
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            <span className="font-semibold">{cotacao.desconto_percent}% de desconto aplicado</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Coberturas */}
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Coberturas Incluídas:</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {cotacao.coberturas.map(cob => (
                                        <div key={cob.tipo} className="flex items-start text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-600 mr-1 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700 capitalize">
                                                {cob.tipo.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Valor Segurado */}
                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Valor total segurado:</span>
                                    <span className="font-bold text-gray-900">
                                        R$ {cotacao.valor_total_segurado.toLocaleString('pt-BR')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-gray-600">Tempo médio de sinistro:</span>
                                    <span className="font-semibold text-gray-900">
                                        {cotacao.seguradora.tempo_medio_sinistro_dias} dias
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-2">
                                <button className="w-full ysh-btn-primary">
                                    Contratar Seguro
                                </button>
                                <div className="flex gap-2">
                                    <button className="flex-1 ysh-btn-secondary text-sm" title="Ligar" aria-label="Ligar para seguradora">
                                        <Phone className="w-4 h-4" />
                                    </button>
                                    <button className="flex-1 ysh-btn-secondary text-sm" title="Email" aria-label="Enviar email">
                                        <Mail className="w-4 h-4" />
                                    </button>
                                    <button className="flex-1 ysh-btn-secondary text-sm" title="Site" aria-label="Visitar site da seguradora">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Score */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Score de recomendação:</span>
                                    <div className="flex items-center">
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mr-2 relative">
                                            <div
                                                className="absolute inset-y-0 left-0 h-full bg-green-600 rounded-full transition-all"
                                                data-score={cotacao.score_recomendacao}
                                                style={{ width: `${Math.min(100, Math.max(0, cotacao.score_recomendacao))}%` } as React.CSSProperties}
                                            />
                                        </div>
                                        <span className="font-bold text-gray-900">{cotacao.score_recomendacao}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleReset}
                        className="ysh-btn-secondary"
                    >
                        Nova Cotação
                    </button>
                    <button className="ysh-btn-primary flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Comparativo PDF
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Potência */}
                        <div>
                            <label htmlFor="potencia" className="block text-sm font-medium text-gray-700 mb-2">
                                Potência do Sistema (kWp) *
                            </label>
                            <input
                                id="potencia"
                                type="number"
                                step="0.01"
                                required
                                placeholder="Ex: 5.0"
                                value={formData.potencia_kwp}
                                onChange={(e) => setFormData({ ...formData, potencia_kwp: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent"
                            />
                        </div>

                        {/* Valor Equipamento */}
                        <div>
                            <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-2">
                                Valor do Equipamento (R$) *
                            </label>
                            <input
                                id="valor"
                                type="number"
                                required
                                placeholder="Ex: 25000"
                                value={formData.valor_equipamento}
                                onChange={(e) => setFormData({ ...formData, valor_equipamento: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent"
                            />
                        </div>

                        {/* Tipo Instalação */}
                        <div>
                            <label htmlFor="tipo-instalacao" className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Instalação *
                            </label>
                            <select
                                id="tipo-instalacao"
                                required
                                value={formData.tipo_instalacao}
                                onChange={(e) => setFormData({ ...formData, tipo_instalacao: e.target.value as any })}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent"
                            >
                                <option value="telhado">Telhado</option>
                                <option value="solo">Solo</option>
                                <option value="fachada">Fachada</option>
                                <option value="estacionamento">Estacionamento (Carport)</option>
                            </select>
                        </div>

                        {/* Tipo Cliente */}
                        <div>
                            <label htmlFor="customer-group" className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Cliente *
                            </label>
                            <select
                                id="customer-group"
                                required
                                value={formData.customer_group}
                                onChange={(e) => setFormData({ ...formData, customer_group: e.target.value as CustomerGroup })}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent"
                            >
                                <option value="residencial-b1">Residencial B1</option>
                                <option value="rural-b2">Rural B2</option>
                                <option value="comercial-b3">Comercial B3</option>
                                <option value="condominios">Condomínios</option>
                                <option value="integradores">Integradores</option>
                                <option value="industria">Indústria</option>
                            </select>
                        </div>

                        {/* UF */}
                        <div>
                            <label htmlFor="uf" className="block text-sm font-medium text-gray-700 mb-2">
                                Estado (UF) *
                            </label>
                            <select
                                id="uf"
                                required
                                value={formData.uf}
                                onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent"
                            >
                                <option value="SP">São Paulo</option>
                                <option value="MG">Minas Gerais</option>
                                <option value="RJ">Rio de Janeiro</option>
                                <option value="RS">Rio Grande do Sul</option>
                                <option value="PR">Paraná</option>
                                <option value="SC">Santa Catarina</option>
                                <option value="BA">Bahia</option>
                                <option value="PE">Pernambuco</option>
                                <option value="CE">Ceará</option>
                                <option value="GO">Goiás</option>
                                <option value="DF">Distrito Federal</option>
                            </select>
                        </div>

                        {/* CEP */}
                        <div>
                            <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
                                CEP
                            </label>
                            <input
                                id="cep"
                                type="text"
                                placeholder="00000-000"
                                value={formData.cep}
                                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent"
                            />
                        </div>
                    </div>

                    {/* Coberturas */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Coberturas Desejadas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                { id: 'equipamento', label: 'Equipamento (Obrigatório)', disabled: true },
                                { id: 'rc', label: 'Responsabilidade Civil' },
                                { id: 'performance', label: 'Garantia de Performance' },
                                { id: 'perda_producao', label: 'Perda de Produção' },
                                { id: 'fenomenos_naturais', label: 'Fenômenos Naturais' },
                                { id: 'transporte', label: 'Transporte' },
                                { id: 'obras', label: 'Cobertura Durante Obras' },
                            ].map(cob => (
                                <label
                                    key={cob.id}
                                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.coberturas_desejadas.includes(cob.id as TipoCobertura)
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        } ${cob.disabled ? 'opacity-75 cursor-not-allowed' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.coberturas_desejadas.includes(cob.id as TipoCobertura)}
                                        onChange={() => toggleCobertura(cob.id as TipoCobertura)}
                                        disabled={cob.disabled}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-700 font-medium">{cob.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Opções Adicionais */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Opções Adicionais (Descontos)
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.possui_monitoramento}
                                    onChange={(e) => setFormData({ ...formData, possui_monitoramento: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <div className="ml-3">
                                    <span className="text-gray-700 font-medium">Sistema com Monitoramento Remoto</span>
                                    <span className="text-sm text-green-600 ml-2">(-5% desconto)</span>
                                </div>
                            </label>

                            <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.possui_manutencao_preventiva}
                                    onChange={(e) => setFormData({ ...formData, possui_manutencao_preventiva: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <div className="ml-3">
                                    <span className="text-gray-700 font-medium">Contrato de Manutenção Preventiva</span>
                                    <span className="text-sm text-green-600 ml-2">(-3% desconto)</span>
                                </div>
                            </label>

                            <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.sistema_off_grid}
                                    onChange={(e) => setFormData({ ...formData, sistema_off_grid: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded-focus:ring-blue-500"
                                />
                                <div className="ml-3">
                                    <span className="text-gray-700 font-medium">Sistema Off-Grid (com baterias)</span>
                                    <span className="text-sm text-gray-500 ml-2">(Cobertura adicional para baterias)</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="ysh-btn-primary px-8 py-3 disabled:opacity-50"
                        >
                            {loading ? 'Cotando...' : 'Comparar Seguros'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
