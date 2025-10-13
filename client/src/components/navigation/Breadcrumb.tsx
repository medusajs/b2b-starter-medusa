import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

// Consistent hierarchy mapping - matches layout.tsx PRIMARY_NAV
const HIERARCHY_MAP = {
    // Primary Level
    discover: { label: 'Descobrir', href: '/discover', icon: '🔍' },
    design: { label: 'Dimensionar', href: '/design', icon: '📐' },
    finance: { label: 'Financiar', href: '/finance', icon: '💰' },
    manage: { label: 'Gerenciar', href: '/manage', icon: '📊' },
    support: { label: 'Suporte', href: '/support', icon: '🛠️' },

    // Secondary Level - Discover
    calculator: { label: 'Calculadora', parent: 'discover' },
    solutions: { label: 'Soluções', parent: 'discover' },
    viability: { label: 'Viabilidade', parent: 'discover' },

    // Secondary Level - Design
    dimensioning: { label: 'Dimensionamento', parent: 'design' },
    proposals: { label: 'Propostas', parent: 'design' },
    cv: { label: 'Análise CV', parent: 'design' },

    // Secondary Level - Finance
    simulation: { label: 'Simulação', parent: 'finance' },
    quotes: { label: 'Cotações', parent: 'finance' },
    incentives: { label: 'Incentivos', parent: 'finance' },

    // Secondary Level - Manage
    projects: { label: 'Projetos', parent: 'manage' },
    contracts: { label: 'Contratos', parent: 'manage' },
    reports: { label: 'Relatórios', parent: 'manage' },

    // Secondary Level - Support
    docs: { label: 'Documentação', parent: 'support' },
    maintenance: { label: 'Manutenção', parent: 'support' },
    contact: { label: 'Contato', parent: 'support' }
}

interface BreadcrumbItem {
    label: string
    href?: string
    icon?: string
    current?: boolean
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
    className?: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
    return (
        <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-sm ${className}`}>
            <Link
                href="/"
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
                <Home className="w-4 h-4 mr-1" />
                <span className="sr-only">Home</span>
            </Link>

            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    {item.current ? (
                        <span className="flex items-center font-medium text-gray-900">
                            {item.icon && <span className="mr-1">{item.icon}</span>}
                            {item.label}
                        </span>
                    ) : (
                        <Link
                            href={item.href || '#'}
                            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {item.icon && <span className="mr-1">{item.icon}</span>}
                            {item.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    )
}

// Helper function to generate breadcrumbs from route
export const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Build hierarchy path
    let currentPath = ''
    segments.forEach((segment, index) => {
        currentPath += `/${segment}`
        const hierarchyItem = HIERARCHY_MAP[segment as keyof typeof HIERARCHY_MAP]

        if (hierarchyItem) {
            const isLast = index === segments.length - 1
            breadcrumbs.push({
                label: hierarchyItem.label,
                href: isLast ? undefined : hierarchyItem.href || currentPath,
                icon: hierarchyItem.icon,
                current: isLast
            })

            // Add parent if exists
            if (hierarchyItem.parent && !breadcrumbs.some(b => b.label === HIERARCHY_MAP[hierarchyItem.parent as keyof typeof HIERARCHY_MAP].label)) {
                const parentItem = HIERARCHY_MAP[hierarchyItem.parent as keyof typeof HIERARCHY_MAP]
                breadcrumbs.unshift({
                    label: parentItem.label,
                    href: parentItem.href,
                    icon: parentItem.icon
                })
            }
        }
    })

    return breadcrumbs
}

export default Breadcrumb