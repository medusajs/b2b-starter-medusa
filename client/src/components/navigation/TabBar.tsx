import React from 'react'
import Link from 'next/link'

// Consistent hierarchy for tab bars - matches PRIMARY_NAV structure
const TAB_HIERARCHY = {
    discover: [
        { key: 'calculator', label: 'Calculadora', href: '/discover/calculator' },
        { key: 'solutions', label: 'Soluções', href: '/discover/solutions' },
        { key: 'viability', label: 'Viabilidade', href: '/discover/viability' }
    ],
    design: [
        { key: 'dimensioning', label: 'Dimensionamento', href: '/design/dimensioning' },
        { key: 'proposals', label: 'Propostas', href: '/design/proposals' },
        { key: 'cv', label: 'Análise CV', href: '/design/cv' }
    ],
    finance: [
        { key: 'simulation', label: 'Simulação', href: '/finance/simulation' },
        { key: 'quotes', label: 'Cotações', href: '/finance/quotes' },
        { key: 'incentives', label: 'Incentivos', href: '/finance/incentives' }
    ],
    manage: [
        { key: 'projects', label: 'Projetos', href: '/manage/projects' },
        { key: 'contracts', label: 'Contratos', href: '/manage/contracts' },
        { key: 'reports', label: 'Relatórios', href: '/manage/reports' }
    ],
    support: [
        { key: 'docs', label: 'Documentação', href: '/support/docs' },
        { key: 'maintenance', label: 'Manutenção', href: '/support/maintenance' },
        { key: 'contact', label: 'Contato', href: '/support/contact' }
    ]
}

interface TabItem {
    key: string
    label: string
    href: string
}

interface TabBarProps {
    section: keyof typeof TAB_HIERARCHY
    activeTab?: string
    className?: string
}

export const TabBar: React.FC<TabBarProps> = ({ section, activeTab, className = '' }) => {
    const tabs = TAB_HIERARCHY[section] || []

    return (
        <div className={`border-b border-gray-200 ${className}`}>
            <nav className="flex space-x-8">
                {tabs.map((tab) => (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </nav>
        </div>
    )
}

// Helper to get active tab from pathname
export const getActiveTab = (pathname: string, section: string): string | undefined => {
    const tabs = TAB_HIERARCHY[section as keyof typeof TAB_HIERARCHY]
    if (!tabs) return undefined

    const pathSegments = pathname.split('/')
    const lastSegment = pathSegments[pathSegments.length - 1]

    return tabs.find(tab => tab.key === lastSegment)?.key
}

export default TabBar