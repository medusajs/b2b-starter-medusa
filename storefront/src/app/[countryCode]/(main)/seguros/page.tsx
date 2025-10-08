import { Metadata } from "next"
import { Shield, TrendingUp, AlertTriangle, Award } from "lucide-react"
import SegurosWrapper from "./SegurosWrapper"

export const metadata: Metadata = {
    title: "Seguros Solar - Proteção Completa para Sistemas Fotovoltaicos | Yello Solar Hub",
    description: "Compare seguros para sistemas solares: equipamento, performance, responsabilidade civil. Coberturas personalizadas por classe de cliente com as melhores seguradoras do Brasil.",
    keywords: "seguro solar, seguro fotovoltaico, seguro painéis solares, seguro inversores, responsabilidade civil solar, Yello Solar Hub",
}

export default function SegurosPage() {
    return (
        <div className="min-h-screen bg-[var(--bg)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="content-container py-12">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-10 h-10 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">
                            Seguros para Sistemas Solares
                        </h1>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">
                            Proteja seu investimento com coberturas completas. Compare as melhores seguradoras
                            e encontre o seguro ideal para seu sistema fotovoltaico.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <SegurosWrapper />

            <div className="content-container py-12">
                {/* Types of Coverage */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                        Tipos de Cobertura
                    </h2>
                    <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
                        Proteja seu sistema solar contra diversos riscos com coberturas personalizadas
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Equipamento
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Roubo, furto, incêndio, raio, explosão e danos elétricos aos painéis e inversores
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Performance
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Garantia de performance mínima de 80% da geração estimada com indenização
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Responsabilidade Civil
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Danos materiais e corporais a terceiros causados pelo sistema solar
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Fenômenos Naturais
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Tempestades, furacões, granizo, inundações e outros eventos climáticos
                            </p>
                        </div>
                    </div>
                </div>

                {/* Coverage by Customer Class */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Coberturas por Tipo de Cliente
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-blue-600 mb-3">🏠 Residencial B1</div>
                            <div className="text-sm text-gray-600 mb-3">Sistemas 3-10 kWp | R$ 18-50k</div>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Equipamento (roubo, incêndio, raio)</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>RC até R$ 50mil</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Fenômenos naturais</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">○</span>
                                    <span>Performance (opcional)</span>
                                </li>
                            </ul>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500">Prêmio estimado:</div>
                                <div className="text-2xl font-bold text-gray-900">R$ 324-900<span className="text-sm font-normal text-gray-600">/ano</span></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-green-600 mb-3">🌾 Rural B2</div>
                            <div className="text-sm text-gray-600 mb-3">Sistemas 5-30 kWp | R$ 30-150k</div>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Equipamento + baterias</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>RC até R$ 100mil</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Fenômenos naturais</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Transporte área remota</span>
                                </li>
                            </ul>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500">Prêmio estimado:</div>
                                <div className="text-2xl font-bold text-gray-900">R$ 750-3.750<span className="text-sm font-normal text-gray-600">/ano</span></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-purple-600 mb-3">🏢 Comercial B3</div>
                            <div className="text-sm text-gray-600 mb-3">Sistemas 20-75 kWp | R$ 100-500k</div>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Equipamento completo</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>RC até R$ 200mil</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Perda de produção/lucros cessantes</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Performance garantida</span>
                                </li>
                            </ul>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500">Prêmio estimado:</div>
                                <div className="text-2xl font-bold text-gray-900">R$ 2.200-11k<span className="text-sm font-normal text-gray-600">/ano</span></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-orange-600 mb-3">🏘️ Condomínios</div>
                            <div className="text-sm text-gray-600 mb-3">Sistemas 50-500 kWp | R$ 250k-2M</div>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Equipamento coletivo</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>RC até R$ 300mil</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Prêmio compartilhado</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Cobertura durante obras</span>
                                </li>
                            </ul>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500">Prêmio estimado:</div>
                                <div className="text-2xl font-bold text-gray-900">R$ 5.500-44k<span className="text-sm font-normal text-gray-600">/ano</span></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-cyan-600 mb-3">🔧 Integradores</div>
                            <div className="text-sm text-gray-600 mb-3">Múltiplos projetos | Varejo</div>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Seguro de estoque</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>RC profissional</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Transporte e entrega</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Cobertura durante instalação</span>
                                </li>
                            </ul>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500">Apólice empresarial:</div>
                                <div className="text-2xl font-bold text-gray-900">R$ 8-25k<span className="text-sm font-normal text-gray-600">/ano</span></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="text-xl font-bold text-red-600 mb-3">🏭 Indústria</div>
                            <div className="text-sm text-gray-600 mb-3">Sistemas 100-5000 kWp | R$ 500k-20M</div>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Equipamento de alta potência</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>RC até R$ 1M-10M</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Perda produção + lucros cessantes</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Performance garantida 80% @ 25 anos</span>
                                </li>
                            </ul>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500">Prêmio estimado:</div>
                                <div className="text-2xl font-bold text-gray-900">R$ 14k-560k<span className="text-sm font-normal text-gray-600">/ano</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Why Insure */}
                <div className="bg-white rounded-xl shadow-sm p-8 mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Por Que Contratar Seguro Solar?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Proteção do Investimento</h3>
                            <p className="text-gray-600 mb-4">
                                Sistemas solares representam investimentos significativos (R$ 18k a R$ 20M).
                                Um seguro garante que você não perderá todo seu investimento em caso de sinistro.
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Payback protegido: não perca anos de ROI</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Reposição rápida de equipamentos danificados</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-600 mr-2">✓</span>
                                    <span>Cobertura contra eventos imprevisíveis</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Exigências Contratuais</h3>
                            <p className="text-gray-600 mb-4">
                                Muitos casos exigem seguro obrigatório para liberação de crédito,
                                contratos PPA ou exigências de condomínios.
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">●</span>
                                    <span>Bancos exigem seguro para financiamento</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">●</span>
                                    <span>Contratos PPA requerem garantias</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-600 mr-2">●</span>
                                    <span>Condomínios exigem RC para aprovação</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Insurance Companies */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
                        Seguradoras Parceiras
                    </h2>
                    <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                        Trabalhamos com as seguradoras mais confiáveis e especializadas em energia solar do Brasil
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {['Porto Seguro', 'Tokio Marine', 'Bradesco Seguros', 'Sura', 'Liberty', 'Mapfre', 'Zurich', 'HDI'].map((seg) => (
                            <div key={seg} className="bg-white p-6 rounded-lg text-center font-semibold text-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                {seg}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-4">
                        Pronto para proteger seu investimento?
                    </h3>
                    <p className="text-lg mb-6 opacity-90">
                        Compare seguros das melhores seguradoras e encontre a cobertura ideal para seu sistema solar.
                    </p>
                    <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        Cotar Seguro Gratuito
                    </button>
                </div>
            </div>
        </div>
    )
}
