import { Metadata } from "next"
import KitCard from "@/modules/catalog/components/KitCard"
import { promises as fs } from 'fs'
import path from 'path'

export const metadata: Metadata = {
    title: "Kits Fotovoltaicos Completos - Yello Solar Hub",
    description: "Kits solares completos on-grid, híbridos e off-grid. Soluções prontas para instalação com painéis, inversores, estruturas e cabos incluídos.",
    keywords: "kits solares, kits fotovoltaicos, kit completo solar, on-grid, híbrido, off-grid, Yello Solar Hub",
}

async function getKitsData() {
    try {
        const catalogPath = path.join(process.cwd(), '../../../../../data/catalog')

        // Load FOTUS kits
        const fotusKitsData = await fs.readFile(path.join(catalogPath, 'fotus-kits.json'), 'utf8')
        const fotusKits = JSON.parse(fotusKitsData)

        // Load YSH kits
        const yshKitsData = await fs.readFile(path.join(catalogPath, 'kits.json'), 'utf8')
        const yshKits = JSON.parse(yshKitsData).kits || JSON.parse(yshKitsData)

        // Load FOTUS hybrid kits
        const fotusHybridData = await fs.readFile(path.join(catalogPath, 'fotus-kits-hibridos.json'), 'utf8')
        const fotusHybridKits = JSON.parse(fotusHybridData)

        return {
            fotusKits,
            yshKits: yshKits.slice(0, 20), // Limit YSH kits
            fotusHybridKits
        }
    } catch (error) {
        console.error('Error loading kits data:', error)
        return { fotusKits: [], yshKits: [], fotusHybridKits: [] }
    }
}

export default async function KitsPage() {
    const { fotusKits, yshKits, fotusHybridKits } = await getKitsData()

    const allKits = [...fotusKits, ...yshKits, ...fotusHybridKits]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="content-container py-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Kits Fotovoltaicos Completos
                        </h1>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Soluções completas e prontas para instalação. Kits on-grid, híbridos e off-grid
                            com todos os componentes necessários para seu sistema solar.
                        </p>
                    </div>
                </div>
            </div>

            <div className="content-container py-12">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-4">
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                aria-label="Filtrar por tipo de kit"
                            >
                                <option>Todos os Tipos</option>
                                <option>On-Grid</option>
                                <option>Híbrido</option>
                                <option>Off-Grid</option>
                            </select>
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                aria-label="Filtrar por potência"
                            >
                                <option>Todas as Potências</option>
                                <option>Até 2kWp</option>
                                <option>2-5kWp</option>
                                <option>5-10kWp</option>
                                <option>10kWp+</option>
                            </select>
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                aria-label="Filtrar por distribuidor"
                            >
                                <option>Todos os Distribuidores</option>
                                <option>FOTUS</option>
                                <option>YSH</option>
                                <option>NeoSolar</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-600">
                            {allKits.length} kits encontrados
                        </div>
                    </div>
                </div>

                {/* Kits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    {allKits.map((kit: any) => (
                        <KitCard key={kit.id} kit={kit} />
                    ))}
                </div>

                {/* Kit Types Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">🔌</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">On-Grid</h3>
                        <p className="text-gray-600 mb-4">
                            Conectado à rede elétrica. Gera economia na conta de luz injetando excedente na rede.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Painéis solares</li>
                            <li>• Inversor on-grid</li>
                            <li>• Estrutura de fixação</li>
                            <li>• Cabos e conectores</li>
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">🔋</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Híbrido</h3>
                        <p className="text-gray-600 mb-4">
                            Combina geração solar com bateria. Ideal para backup e maior independência energética.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Painéis solares</li>
                            <li>• Inversor híbrido</li>
                            <li>• Bateria de lítio</li>
                            <li>• Estrutura completa</li>
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">🏠</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Off-Grid</h3>
                        <p className="text-gray-600 mb-4">
                            Sistema independente da rede. Perfeito para locais remotos ou máxima autonomia.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Painéis solares</li>
                            <li>• Inversor off-grid</li>
                            <li>• Banco de baterias</li>
                            <li>• Controlador de carga</li>
                        </ul>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-8 text-center text-gray-900">
                    <h3 className="text-2xl font-bold mb-4">
                        Não encontrou o kit ideal?
                    </h3>
                    <p className="text-lg mb-6 opacity-90">
                        Podemos montar um kit personalizado com os componentes que você precisa.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/dimensionamento" className="ysh-btn-secondary">
                            Fazer Dimensionamento
                        </a>
                        <a href="/contato" className="ysh-btn-outline">
                            Consultoria Gratuita
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}