import { Metadata } from "next"
import { ShieldCheck, FileCheck, FileText, AlertCircle } from "lucide-react"
import ComplianceWrapper from "./ComplianceWrapper"

export const metadata: Metadata = {
    title: "Compliance Solar ANEEL - Validação PRODIST | Yello Solar Hub",
    description: "Validador PRODIST, checklist ANEEL e gerador de dossiê técnico para homologação de sistemas fotovoltaicos. Conformidade garantida para micro e minigeração.",
    keywords: "compliance solar, PRODIST, ANEEL, homologação solar, dossiê técnico, microgeração, minigeração, Yello Solar Hub",
}

export default function CompliancePage() {
    return (
        <div className="min-h-screen bg-[var(--bg)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <div className="content-container py-12">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">
                            Compliance Solar ANEEL
                        </h1>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">
                            Valide a conformidade do seu sistema com PRODIST, gere checklist ANEEL
                            e automatize seu dossiê técnico para homologação.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <ComplianceWrapper />

            <div className="content-container py-12">
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-[var(--surface)] p-8 rounded-xl shadow-sm border border-[var(--border)]">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Validador PRODIST
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Validação automática de conformidade com PRODIST Módulo 3 - Acesso ao Sistema de Distribuição:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Verificação de limites de potência (micro/mini)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Validação de oversizing (REN 1.059/2023)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Conformidade de tensão por classe tarifária</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Análise de modalidade MMGD</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-[var(--surface)] p-8 rounded-xl shadow-sm border border-[var(--border)]">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <FileCheck className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Checklist ANEEL
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Gerador inteligente de checklist personalizado por distribuidora, classe e modalidade:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Documentação básica (CPF/CNPJ, RG, comprovantes)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Certificações técnicas (Inmetro, datasheets)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Projeto elétrico (ART, unifilar, memorial)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Segurança (SPDA, aterramento, proteções)</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-[var(--surface)] p-8 rounded-xl shadow-sm border border-[var(--border)]">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                            <FileText className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Dossiê Técnico
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Automatização completa do dossiê técnico para envio à distribuidora:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Dados do cliente e instalação consolidados</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Memorial descritivo gerado automaticamente</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Lista de materiais (BOM) completa</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span>Upload de diagramas e documentos</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* How it Works */}
                <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Como Funciona a Validação
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">1️⃣</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Informe os Dados
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Potência, tensão, classe tarifária, distribuidora e modalidade MMGD
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">2️⃣</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Validação PRODIST
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Sistema valida conformidade com normas técnicas da ANEEL
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">3️⃣</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Checklist Personalizado
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Geração automática de checklist com documentos obrigatórios
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">4️⃣</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Dossiê Completo
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Download do dossiê técnico pronto para envio à distribuidora
                            </p>
                        </div>
                    </div>
                </div>

                {/* Support by Customer Class */}
                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8 mb-12">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Suporte Multi-Classe
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-blue-600 mb-2">📊 Residencial B1</div>
                            <p className="text-gray-600 text-sm mb-3">
                                Microgeração até 75 kWp, oversizing 145%, docs simplificados
                            </p>
                            <div className="text-xs text-gray-500">
                                Validação: Potência, tensão 127/220V, PRODIST, checklist básico
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-green-600 mb-2">🌾 Rural B2</div>
                            <p className="text-gray-600 text-sm mb-3">
                                Rural/agro, tarifas subsidiadas, sistemas off-grid e híbridos
                            </p>
                            <div className="text-xs text-gray-500">
                                Validação: Classe B2, tensão rural, modalidades especiais
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-purple-600 mb-2">🏢 Comercial B3</div>
                            <p className="text-gray-600 text-sm mb-3">
                                Micro/minigeração, AVCB, licenças ambientais, documentação completa
                            </p>
                            <div className="text-xs text-gray-500">
                                Validação: Tensão comercial, minigeração, docs segurança
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-orange-600 mb-2">🏘️ Condomínios</div>
                            <p className="text-gray-600 text-sm mb-3">
                                Geração compartilhada (GC), múltiplas UCs, rateio de créditos
                            </p>
                            <div className="text-xs text-gray-500">
                                Validação: Modalidade GC, lista participantes, ata assembleia
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-cyan-600 mb-2">🔧 Integradores</div>
                            <p className="text-gray-600 text-sm mb-3">
                                Templates de docs, validação em lote, biblioteca de projetos
                            </p>
                            <div className="text-xs text-gray-500">
                                Validação: Multi-projeto, biblioteca templates, bulk check
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-red-600 mb-2">🏭 Indústria</div>
                            <p className="text-gray-600 text-sm mb-3">
                                Grupo A (A4-A1), minigeração {'>'} 75kWp, subestação, média tensão
                            </p>
                            <div className="text-xs text-gray-500">
                                Validação: Classe A, alta potência, estudos especiais, licenças
                            </div>
                        </div>
                    </div>
                </div>

                {/* Distribuidoras */}
                <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
                        Distribuidoras Suportadas
                    </h2>
                    <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                        Prazos e requisitos específicos configurados para as principais distribuidoras do Brasil
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {['CEMIG', 'CPFL Paulista', 'Enel SP', 'Enel RJ', 'Light', 'Copel', 'Celesc', 'Coelba', 'Cosern', 'Celpe'].map((dist) => (
                            <div key={dist} className="bg-gray-50 p-4 rounded-lg text-center font-semibold text-gray-700">
                                {dist}
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-6">
                        + Outras distribuidoras sob demanda
                    </p>
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-12">
                    <div className="flex items-start">
                        <AlertCircle className="w-6 h-6 text-yellow-600 mr-4 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-bold text-yellow-900 mb-2">
                                Importante: Regulamentação Atualizada
                            </h3>
                            <p className="text-yellow-800 mb-2">
                                Este validador está atualizado com a <strong>REN 1.059/2023</strong> (Marco Legal da GD)
                                e <strong>PRODIST Módulo 3 Revisão 11</strong>.
                            </p>
                            <ul className="list-disc list-inside text-yellow-800 space-y-1 text-sm">
                                <li>Oversizing máximo: <strong>145%</strong> até 31/12/2028</li>
                                <li>Microgeração: até <strong>75 kWp</strong></li>
                                <li>Minigeração: de 75 kWp a <strong>5 MWp</strong></li>
                                <li>Prazo análise: <strong>34 dias úteis</strong> (micro) | <strong>49 dias úteis</strong> (mini)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-4">
                        Pronto para validar seu projeto?
                    </h3>
                    <p className="text-lg mb-6 opacity-90">
                        Use nosso validador PRODIST e garanta conformidade total com as normas ANEEL.
                    </p>
                    <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        Iniciar Validação Gratuita
                    </button>
                </div>
            </div>
        </div>
    )
}
