"use client"

import { Bolt, Sun } from "@medusajs/icons"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"

const MODALIDADES = [
    {
        id: "on-grid",
        title: "On-Grid (Economia)",
        description: "Conectado à rede, ideal para reduzir conta de luz",
        icon: Sun,
        beneficios: ["Economia até 95%", "ROI 3-5 anos", "Sem baterias"],
        href: "/produtos?modalidade=on-grid",
        color: "from-blue-500 to-blue-600"
    },
    {
        id: "hibrido",
        title: "Híbrido (Backup)",
        description: "Rede + baterias para garantir energia 24/7",
        icon: Bolt,
        beneficios: ["Backup automático", "Segurança energética", "Uso noturno"],
        href: "/produtos?modalidade=hibrido",
        color: "from-purple-500 to-purple-600"
    },
    {
        id: "off-grid",
        title: "Off-Grid (Autonomia)",
        description: "Sistema autônomo, sem depender da rede",
        icon: Bolt,
        beneficios: ["100% independente", "Áreas remotas", "Banco de baterias"],
        href: "/produtos?modalidade=off-grid",
        color: "from-green-500 to-green-600"
    },
    {
        id: "eaas-ppa",
        title: "EaaS/PPA (Serviço)",
        description: "Energia como serviço, sem investimento inicial",
        icon: Sun,
        beneficios: ["Zero investimento", "Economia imediata", "Contrato longo prazo"],
        href: "/cotacao?tipo=eaas",
        color: "from-yellow-500 to-yellow-600"
    }
]

export default function ModalidadesGrid() {
    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-slate-50 py-24">
            <div className="content-container">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                        <Bolt className="w-4 h-4 text-blue-600" />
                        <Text className="text-blue-700 text-sm uppercase tracking-wider font-semibold">
                            Modalidades Energéticas
                        </Text>
                    </div>
                    <Heading level="h2" className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Qual a sua
                        <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                            necessidade?
                        </span>
                    </Heading>
                    <Text className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Escolha entre economia, backup, autonomia ou serviço
                    </Text>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {MODALIDADES.map((modalidade) => {
                        const Icon = modalidade.icon
                        return (
                            <LocalizedClientLink
                                key={modalidade.id}
                                href={modalidade.href}
                                className="group"
                                data-testid={`modalidade-card-${modalidade.id}`}
                            >
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/90 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col group-hover:scale-[1.02]">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    <Heading level="h3" className="text-2xl font-bold text-gray-900 mb-3">
                                        {modalidade.title}
                                    </Heading>

                                    <Text className="text-gray-600 mb-6 leading-relaxed">
                                        {modalidade.description}
                                    </Text>

                                    <ul className="space-y-3 mb-6 flex-grow">
                                        {modalidade.beneficios.map((beneficio) => (
                                            <li key={beneficio} className="flex items-center gap-3 text-sm text-gray-700">
                                                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                                                {beneficio}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex items-center justify-between">
                                        <Text className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors">
                                            Ver opções
                                        </Text>
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-sm">→</span>
                                        </div>
                                    </div>
                                </div>
                            </LocalizedClientLink>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
