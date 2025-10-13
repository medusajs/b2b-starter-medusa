import type { Metadata } from "next"
import "../styles/globals.css"

export const metadata: Metadata = {
    title: "YSH - Yello Solar Hub",
    description: "Plataforma B2B para Energia Solar",
}

// Navigation Model: Solar Service Lifecycle
// Primary Navigation (Top Level) - Based on Buyer Journey Stages
const PRIMARY_NAV = {
    discover: {
        label: "Descobrir",
        href: "/discover",
        description: "Explore soluções solares para seu perfil",
        icon: "🔍",
        subnav: {
            calculator: { label: "Calculadora Solar", href: "/discover/calculator" },
            solutions: { label: "Soluções por Classe", href: "/discover/solutions" },
            viability: { label: "Viabilidade Técnica", href: "/discover/viability" }
        }
    },
    design: {
        label: "Dimensionar",
        href: "/design",
        description: "Calcule e projete seu sistema ideal",
        icon: "📐",
        subnav: {
            dimensioning: { label: "Dimensionamento", href: "/design/dimensioning" },
            proposals: { label: "Propostas Técnicas", href: "/design/proposals" },
            cv: { label: "Análise CV Solar", href: "/design/cv" }
        }
    },
    finance: {
        label: "Financiar",
        href: "/finance",
        description: "Simule financiamento e cotações",
        icon: "💰",
        subnav: {
            simulation: { label: "Simulação", href: "/finance/simulation" },
            quotes: { label: "Cotações", href: "/finance/quotes" },
            incentives: { label: "Incentivos Fiscais", href: "/finance/incentives" }
        }
    },
    manage: {
        label: "Gerenciar",
        href: "/manage",
        description: "Acompanhe projetos e contratos",
        icon: "📊",
        subnav: {
            projects: { label: "Meus Projetos", href: "/manage/projects" },
            contracts: { label: "Contratos", href: "/manage/contracts" },
            reports: { label: "Relatórios ESG", href: "/manage/reports" }
        }
    },
    support: {
        label: "Suporte",
        href: "/support",
        description: "Recursos e assistência técnica",
        icon: "🛠️",
        subnav: {
            docs: { label: "Documentação", href: "/support/docs" },
            maintenance: { label: "Manutenção", href: "/support/maintenance" },
            contact: { label: "Contato", href: "/support/contact" }
        }
    }
}

// Secondary Navigation (Contextual) - Cross-flow Links
const SECONDARY_NAV = {
    quickActions: [
        { label: "Agendar Consulta", href: "/schedule", priority: "high" },
        { label: "Download App", href: "/app", priority: "medium" },
        { label: "Portal Parceiro", href: "/partners", priority: "low" }
    ],
    crossLinks: {
        fromDimensioning: ["finance/simulation", "design/proposals"],
        fromFinance: ["manage/projects", "support/docs"],
        fromSupport: ["discover/solutions", "design/cv"]
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body>
                {/* Navigation Context Provider - Makes nav model available to all components */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.YSH_NAV = ${JSON.stringify({ PRIMARY_NAV, SECONDARY_NAV })}`
                    }}
                />
                {children}
            </body>
        </html>
    )
}
