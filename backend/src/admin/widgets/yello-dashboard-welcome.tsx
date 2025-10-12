import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { YelloBranding } from "../components/yello-branding"

/**
 * Yello Solar Hub Dashboard Widget
 * 
 * Widget de boas-vindas personalizado exibindo o branding da Yello Solar Hub
 * e estatísticas rápidas do sistema.
 * 
 * Injeta o widget na página de overview do dashboard admin.
 * 
 * Padrão Medusa.js: https://docs.medusajs.com/learn/fundamentals/admin/widgets
 */
const YelloDashboardWidget = () => {
    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-x-4">
                    <YelloBranding size="medium" variant="black" showText={true} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-ui-fg-subtle">
                        Painel Administrativo
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 px-6 py-4">
                <StatCard
                    icon="☀️"
                    label="Catálogo Solar"
                    value="1.123 produtos"
                    description="Equipamentos fotovoltaicos"
                />
                <StatCard
                    icon="⚡"
                    label="Cotações B2B"
                    value="Ativas"
                    description="Sistema de cotações habilitado"
                />
                <StatCard
                    icon="📈"
                    label="Modo"
                    value="Produção"
                    description="Backend Medusa 2.10.3"
                />
            </div>
        </Container>
    )
}

const StatCard = ({
    icon,
    label,
    value,
    description,
}: {
    icon: string
    label: string
    value: string
    description: string
}) => {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ui-bg-subtle text-2xl">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-ui-fg-subtle">{label}</span>
                <Heading level="h3" className="text-lg font-semibold">
                    {value}
                </Heading>
                <span className="text-xs text-ui-fg-muted">{description}</span>
            </div>
        </div>
    )
}

/**
 * Widget Configuration
 * 
 * Injeta o widget na rota "/" (dashboard principal) na zona "order.list.before"
 * Referência: https://docs.medusajs.com/learn/fundamentals/admin/widgets
 */
export const config = defineWidgetConfig({
    zone: "order.list.before",
})

export default YelloDashboardWidget
