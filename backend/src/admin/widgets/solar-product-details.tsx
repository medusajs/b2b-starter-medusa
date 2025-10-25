import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminProduct } from "@medusajs/framework/types"
import { Container, Heading, Badge } from "@medusajs/ui"

/**
 * Solar Product Technical Specifications Widget
 * 
 * Displays solar-specific technical details on product detail pages:
 * - Power ratings (kW, W)
 * - Voltage and current specifications
 * - Efficiency ratings
 * - Technology type (Monocrystalline, Grid-Tie, Off-Grid, etc.)
 * - Phase information (Monofásico, Trifásico)
 * - Warranty and certification info
 */

interface SolarProductDetailsProps {
    data: AdminProduct
}

const SolarProductDetails = ({ data }: SolarProductDetailsProps) => {
    const technicalSpecs = data.metadata?.technical_specs || {}
    const category = String(data.metadata?.category || data.collection?.metadata?.category || 'unknown')

    // Extract specs based on category
    const specs = extractSpecsByCategory(category, technicalSpecs, data.metadata)

    if (Object.keys(specs).length === 0) {
        return null // Don't show widget if no solar specs available
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                    <Heading level="h2">Especificações Técnicas Solares</Heading>
                </div>
                <Badge color="green">{getCategoryLabel(category)}</Badge>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {specs.map((spec, index) => (
                        <SpecCard key={index} {...spec} />
                    ))}
                </div>
            </div>

            {/* Additional Info Section */}
            {(data.metadata?.manufacturer || data.metadata?.model) && (
                <div className="px-6 py-4 bg-ui-bg-subtle">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {data.metadata.manufacturer && (
                            <div>
                                <span className="text-ui-fg-subtle">Fabricante: </span>
                                <span className="font-medium">{String(data.metadata.manufacturer)}</span>
                            </div>
                        )}
                        {data.metadata.model && (
                            <div>
                                <span className="text-ui-fg-subtle">Modelo: </span>
                                <span className="font-medium">{String(data.metadata.model)}</span>
                            </div>
                        )}
                        {data.metadata.source && (
                            <div>
                                <span className="text-ui-fg-subtle">Distribuidor: </span>
                                <span className="font-medium">{String(data.metadata.source)}</span>
                            </div>
                        )}
                        {data.metadata?.normalized_at && (
                            <div>
                                <span className="text-ui-fg-subtle">Última Atualização: </span>
                                <span className="font-medium">
                                    {new Date(data.metadata.normalized_at as string).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Container>
    )
}

// Helper Functions

interface Spec {
    label: string
    value: string | number
    unit?: string
    icon?: string
    highlight?: boolean
}

function extractSpecsByCategory(category: string, technicalSpecs: any, metadata: any): Spec[] {
    const specs: Spec[] = []

    switch (category) {
        case 'panels':
            if (technicalSpecs.power_w) {
                specs.push({
                    label: 'Potência Nominal',
                    value: technicalSpecs.power_w,
                    unit: 'W',
                    icon: '⚡',
                    highlight: true
                })
            }
            if (technicalSpecs.technology) {
                specs.push({
                    label: 'Tecnologia',
                    value: technicalSpecs.technology,
                    icon: '🔬'
                })
            }
            if (technicalSpecs.efficiency) {
                specs.push({
                    label: 'Eficiência',
                    value: technicalSpecs.efficiency,
                    unit: '%',
                    icon: '📊'
                })
            }
            if (technicalSpecs.voltage_v) {
                specs.push({
                    label: 'Tensão',
                    value: technicalSpecs.voltage_v,
                    unit: 'V',
                    icon: '🔋'
                })
            }
            if (technicalSpecs.current_a) {
                specs.push({
                    label: 'Corrente',
                    value: technicalSpecs.current_a,
                    unit: 'A',
                    icon: '⚡'
                })
            }
            break

        case 'inverters':
            if (technicalSpecs.power_kw) {
                specs.push({
                    label: 'Potência Nominal',
                    value: technicalSpecs.power_kw,
                    unit: 'kW',
                    icon: '⚡',
                    highlight: true
                })
            } else if (technicalSpecs.power_w) {
                specs.push({
                    label: 'Potência Nominal',
                    value: (technicalSpecs.power_w / 1000).toFixed(2),
                    unit: 'kW',
                    icon: '⚡',
                    highlight: true
                })
            }
            if (technicalSpecs.type) {
                specs.push({
                    label: 'Tipo de Inversor',
                    value: technicalSpecs.type,
                    icon: '🔧'
                })
            }
            if (technicalSpecs.voltage_v) {
                specs.push({
                    label: 'Tensão de Saída',
                    value: technicalSpecs.voltage_v,
                    unit: 'V',
                    icon: '🔋'
                })
            }
            if (technicalSpecs.phases) {
                specs.push({
                    label: 'Fases',
                    value: technicalSpecs.phases,
                    icon: '📡'
                })
            }
            if (technicalSpecs.efficiency) {
                specs.push({
                    label: 'Eficiência',
                    value: technicalSpecs.efficiency,
                    unit: '%',
                    icon: '📊'
                })
            }
            if (technicalSpecs.current_a) {
                specs.push({
                    label: 'Corrente Máxima',
                    value: technicalSpecs.current_a,
                    unit: 'A',
                    icon: '⚡'
                })
            }
            break

        case 'kits':
            if (technicalSpecs.potencia_kwp || metadata?.potencia_kwp) {
                specs.push({
                    label: 'Potência do Sistema',
                    value: technicalSpecs.potencia_kwp || metadata.potencia_kwp,
                    unit: 'kWp',
                    icon: '⚡',
                    highlight: true
                })
            }
            if (technicalSpecs.total_power_w) {
                specs.push({
                    label: 'Potência Total',
                    value: (technicalSpecs.total_power_w / 1000).toFixed(2),
                    unit: 'kW',
                    icon: '⚡'
                })
            }
            if (technicalSpecs.total_panels || metadata?.total_panels) {
                specs.push({
                    label: 'Quantidade de Painéis',
                    value: technicalSpecs.total_panels || metadata.total_panels,
                    icon: '☀️'
                })
            }
            if (technicalSpecs.total_inverters || metadata?.total_inverters) {
                specs.push({
                    label: 'Quantidade de Inversores',
                    value: technicalSpecs.total_inverters || metadata.total_inverters,
                    icon: '⚙️'
                })
            }
            if (metadata?.estrutura) {
                specs.push({
                    label: 'Tipo de Estrutura',
                    value: metadata.estrutura,
                    icon: '🏗️'
                })
            }
            if (metadata?.centro_distribuicao) {
                specs.push({
                    label: 'Centro de Distribuição',
                    value: metadata.centro_distribuicao,
                    icon: '📍'
                })
            }
            break

        case 'batteries':
            if (technicalSpecs.capacity_ah) {
                specs.push({
                    label: 'Capacidade',
                    value: technicalSpecs.capacity_ah,
                    unit: 'Ah',
                    icon: '🔋',
                    highlight: true
                })
            }
            if (technicalSpecs.voltage_v) {
                specs.push({
                    label: 'Tensão',
                    value: technicalSpecs.voltage_v,
                    unit: 'V',
                    icon: '⚡'
                })
            }
            if (technicalSpecs.technology) {
                specs.push({
                    label: 'Tecnologia',
                    value: technicalSpecs.technology,
                    icon: '🔬'
                })
            }
            break

        case 'controllers':
            if (technicalSpecs.max_current_a) {
                specs.push({
                    label: 'Corrente Máxima',
                    value: technicalSpecs.max_current_a,
                    unit: 'A',
                    icon: '⚡',
                    highlight: true
                })
            }
            if (technicalSpecs.voltage_v) {
                specs.push({
                    label: 'Tensão do Sistema',
                    value: technicalSpecs.voltage_v,
                    unit: 'V',
                    icon: '🔋'
                })
            }
            if (technicalSpecs.type) {
                specs.push({
                    label: 'Tipo',
                    value: technicalSpecs.type,
                    icon: '🔧'
                })
            }
            break

        case 'chargers':
        case 'ev_chargers':
            if (technicalSpecs.power_kw) {
                specs.push({
                    label: 'Potência de Carga',
                    value: technicalSpecs.power_kw,
                    unit: 'kW',
                    icon: '⚡',
                    highlight: true
                })
            }
            if (technicalSpecs.voltage_v) {
                specs.push({
                    label: 'Tensão',
                    value: technicalSpecs.voltage_v,
                    unit: 'V',
                    icon: '🔋'
                })
            }
            if (technicalSpecs.phases) {
                specs.push({
                    label: 'Fases',
                    value: technicalSpecs.phases,
                    icon: '📡'
                })
            }
            if (technicalSpecs.connector_type) {
                specs.push({
                    label: 'Tipo de Conector',
                    value: technicalSpecs.connector_type,
                    icon: '🔌'
                })
            }
            break

        default:
            // Generic specs for other categories
            if (technicalSpecs.power_w || technicalSpecs.power_kw) {
                specs.push({
                    label: 'Potência',
                    value: technicalSpecs.power_kw || (technicalSpecs.power_w / 1000),
                    unit: technicalSpecs.power_kw ? 'kW' : 'W',
                    icon: '⚡',
                    highlight: true
                })
            }
    }

    return specs
}

function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
        panels: '☀️',
        inverters: '⚡',
        kits: '🔆',
        batteries: '🔋',
        cables: '🔌',
        controllers: '🎛️',
        chargers: '🔌',
        ev_chargers: '🚗',
        structures: '🏗️',
        stringboxes: '📦'
    }
    return icons[category] || '📦'
}

function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
        panels: 'Painel Solar',
        inverters: 'Inversor',
        kits: 'Kit Solar',
        batteries: 'Bateria',
        cables: 'Cabo',
        controllers: 'Controlador',
        chargers: 'Carregador',
        ev_chargers: 'Carregador EV',
        structures: 'Estrutura',
        stringboxes: 'String Box'
    }
    return labels[category] || 'Produto Solar'
}

// Spec Card Component
interface SpecCardProps extends Spec { }

const SpecCard = ({ label, value, unit, icon, highlight }: SpecCardProps) => (
    <div className={`rounded-lg border p-4 ${highlight ? 'border-blue-500 bg-blue-50' : 'border-ui-border-base bg-ui-bg-base'}`}>
        <div className="flex items-start justify-between mb-2">
            <span className="text-ui-fg-subtle text-sm">{label}</span>
            {icon && <span className="text-xl">{icon}</span>}
        </div>
        <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-semibold ${highlight ? 'text-blue-600' : 'text-ui-fg-base'}`}>
                {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </span>
            {unit && <span className="text-ui-fg-subtle text-sm">{unit}</span>}
        </div>
    </div>
)

// Widget Configuration - Show on product details pages
export const config = defineWidgetConfig({
    zone: "product.details.after",
})

export default SolarProductDetails
