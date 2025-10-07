import { Metadata } from "next"
import { Calculator, Home, Factory, MapPin } from "lucide-react"

export const metadata: Metadata = {
    title: "Dimensionamento Solar - Yello Solar Hub",
    description: "Calcule o tamanho ideal do seu sistema solar. Dimensionamento personalizado baseado no seu consumo de energia.",
    keywords: "dimensionamento solar, calculadora solar, sistema solar, economia energia, Yello Solar Hub",
}

export default function DimensionamentoPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900">
                <div className="content-container py-12">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calculator className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">
                            Dimensionamento Solar
                        </h1>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">
                            Descubra o tamanho ideal do sistema solar para sua residência ou empresa.
                            Calcule sua economia e veja recomendações personalizadas.
                        </p>
                    </div>
                </div>
            </div>

            <div className="content-container py-12">
                {/* Input Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-xl shadow-sm">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <Home className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Tenho conta de luz
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Faça upload da sua conta de energia e nosso algoritmo calculará automaticamente
                            o consumo médio e recomendará o sistema ideal.
                        </p>
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <div className="text-gray-500 mb-2">
                                    📄 Arraste sua conta de luz aqui
                                </div>
                                <div className="text-sm text-gray-400">
                                    ou <button className="text-blue-600 hover:underline">clique para selecionar</button>
                                </div>
                            </div>
                            <button className="w-full ysh-btn-primary">
                                Calcular com Conta de Luz
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <Calculator className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Sei meu consumo
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Informe seu consumo mensal em kWh e outros detalhes para obter uma
                            recomendação precisa do sistema solar.
                        </p>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Consumo mensal (kWh)
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    placeholder="Ex: 350"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de instalação
                                </label>
                                <select
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    aria-label="Tipo de instalação"
                                >
                                    <option>Telhado cerâmico</option>
                                    <option>Laje</option>
                                    <option>Solo</option>
                                    <option>Estrutura metálica</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full ysh-btn-primary">
                                Calcular Sistema
                            </button>
                        </form>
                    </div>
                </div>

                {/* How it Works */}
                <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Como Funciona o Dimensionamento
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">1️⃣</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Análise de Consumo
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Avaliamos seu perfil de consumo energético
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">2️⃣</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Cálculo Técnico
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Determinamos a potência necessária em kWp
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">3️⃣</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Recomendação
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Sugerimos os melhores componentes e kits
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">4️⃣</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Orçamento
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Receba proposta completa com economia projetada
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">70-90%</div>
                        <div className="text-gray-600">Redução na conta de luz</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">25 anos</div>
                        <div className="text-gray-600">Garantia dos painéis</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-2">4-7 anos</div>
                        <div className="text-gray-600">Payback do investimento</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">0%</div>
                        <div className="text-gray-600">Manutenção necessária</div>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-4">
                        Pronto para gerar energia limpa?
                    </h3>
                    <p className="text-lg mb-6 opacity-90">
                        Comece seu dimensionamento agora e descubra quanto você pode economizar.
                    </p>
                    <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        Iniciar Dimensionamento Gratuito
                    </button>
                </div>
            </div>
        </div>
    )
}