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
        <div className="bg-gray-50 py-16">
            <div className="content-container">
                <div className="text-center mb-12">
                    <Text className="text-blue-600 text-sm uppercase tracking-wider font-semibold mb-2">
                        Modalidades Energéticas
                    </Text>
                    <Heading level="h2" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Qual a sua necessidade?
                    </Heading>
                    <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Escolha entre economia, backup, autonomia ou serviço
                    </Text>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MODALIDADES.map((modalidade) => {
                        const Icon = modalidade.icon
                        return (
                            <LocalizedClientLink
                                key={modalidade.id}
                                href={modalidade.href}
                                className="group"
                                data-testid={`modalidade-card-${modalidade.id}`}
                            >
                                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${modalidade.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    <Heading level="h3" className="text-lg font-bold text-gray-900 mb-2">
                                        {modalidade.title}
                                    </Heading>

                                    <Text className="text-gray-600 text-sm mb-4">
                                        {modalidade.description}
                                    </Text>

                                    <ul className="space-y-2 mb-4 flex-grow">
                                        {modalidade.beneficios.map((beneficio) => (
                                            <li key={beneficio} className="flex items-center gap-2 text-sm text-gray-700">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                {beneficio}
                                            </li>
                                        ))}
                                    </ul>

                                    <Text className="text-blue-600 font-semibold group-hover:underline text-sm">
                                        Ver opções →
                                    </Text>
                                </div>
                            </LocalizedClientLink>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
