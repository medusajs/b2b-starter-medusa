"use client"

import { Building, Factory, Home, Users, Zap } from "@medusajs/icons"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"

const CLASSES = [
    {
        id: "residencial-b1",
        title: "Residencial B1",
        description: "Kits on-grid para economia na conta de luz",
        icon: Home,
        modalidades: ["on-grid", "híbrido"],
        cta: "Ver kits residenciais",
        href: "/solucoes?classe=residencial-b1",
        color: "from-blue-500 to-blue-600"
    },
    {
        id: "rural-b2",
        title: "Rural B2",
        description: "Soluções off-grid e híbridas para propriedades rurais",
        icon: Zap,
        modalidades: ["off-grid", "híbrido"],
        cta: "Ver soluções rurais",
        href: "/solucoes?classe=rural-b2",
        color: "from-green-500 to-green-600"
    },
    {
        id: "comercial-b3",
        title: "Comercial/PME B3",
        description: "Sistemas dimensionados para empresas e comércio",
        icon: Building,
        modalidades: ["on-grid", "EaaS"],
        cta: "Cotação empresarial",
        href: "/solucoes?classe=comercial-b3",
        color: "from-yellow-500 to-yellow-600"
    },
    {
        id: "condominios",
        title: "Condomínios",
        description: "Geração compartilhada para áreas comuns",
        icon: Users,
        modalidades: ["geração compartilhada"],
        cta: "Soluções coletivas",
        href: "/solucoes?classe=condominios",
        color: "from-purple-500 to-purple-600"
    },
    {
        id: "industria",
        title: "Indústria/Grandes",
        description: "EaaS e PPA para grandes contas",
        icon: Factory,
        modalidades: ["EaaS", "PPA"],
        cta: "Falar com especialista",
        href: "/cotacao?tipo=enterprise",
        color: "from-red-500 to-red-600"
    }
]

export default function SolutionsByClass() {
    return (
        <div className="bg-white py-16">
            <div className="content-container">
                <div className="text-center mb-12">
                    <Text className="text-blue-600 text-sm uppercase tracking-wider font-semibold mb-2">
                        Soluções por Perfil
                    </Text>
                    <Heading level="h2" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Energia solar para cada necessidade
                    </Heading>
                    <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Escolha a solução ideal por classe consumidora e modalidade energética
                    </Text>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CLASSES.map((classe) => {
                        const Icon = classe.icon
                        return (
                            <LocalizedClientLink
                                key={classe.id}
                                href={classe.href}
                                className="group"
                                data-testid={`class-card-${classe.id}`}
                            >
                                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${classe.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    <Heading level="h3" className="text-xl font-bold text-gray-900 mb-2">
                                        {classe.title}
                                    </Heading>

                                    <Text className="text-gray-600 mb-4 flex-grow">
                                        {classe.description}
                                    </Text>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {classe.modalidades.map((mod) => (
                                            <span
                                                key={mod}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                            >
                                                {mod}
                                            </span>
                                        ))}
                                    </div>

                                    <Text className="text-blue-600 font-semibold group-hover:underline">
                                        {classe.cta} →
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
