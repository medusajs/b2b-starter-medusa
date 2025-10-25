import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminProduct } from "@medusajs/framework/types"
import { Container, Heading, Badge, Button, Select } from "@medusajs/ui"
import { useState } from "react"
import {
    calculatePanelToInverterRatio,
    estimateEnergyGeneration,
    validateSystemCompatibility,
    projectEnergyGeneration,
    PEAK_SUN_HOURS_BY_STATE,
    type SolarPanel,
    type SolarInverter,
    type SolarSystem
} from "../../modules/solar-calculator"/**
 * Solar Kit Composition Widget
 * 
 * Displays detailed information about solar kit components:
 * - Individual panels with specifications
 * - Inverters and their capacities
 * - Batteries (if applicable)
 * - Mounting structures
 * - Total system power calculations
 * - Panel-to-inverter ratio analysis
 * - Component compatibility checks
 */

interface SolarKitCompositionProps {
    data: AdminProduct
}

interface PanelInfo {
    brand: string
    power_w: number
    quantity: number
    description: string
}

interface InverterInfo {
    brand: string
    power_kw: number
    quantity: number
    description: string
}

interface BatteryInfo {
    brand?: string
    capacity_ah?: number
    voltage_v?: number
    quantity?: number
    description?: string
}

const SolarKitComposition = ({ data }: SolarKitCompositionProps) => {
    const [showCalculator, setShowCalculator] = useState(false)
    const [selectedState, setSelectedState] = useState('SP')
    const [showDegradation, setShowDegradation] = useState(false)
    const [showCompatibility, setShowCompatibility] = useState(false)

    // Check if this is a kit product
    const category = String(data.metadata?.category || '')
    if (category !== 'kits' && !data.metadata?.type?.toString().includes('kit')) {
        return null // Only show for kit products
    }

    // Extract kit components
    const panels: PanelInfo[] = (data.metadata?.panels as PanelInfo[]) || []
    const inverters: InverterInfo[] = (data.metadata?.inverters as InverterInfo[]) || []
    const batteries: BatteryInfo[] = (data.metadata?.batteries as BatteryInfo[]) || []
    const structures = data.metadata?.structures || []

    // Convert widget data to solar-calculator types
    const solarPanels: SolarPanel[] = panels.map((p, idx) => ({
        id: `panel-${idx}`,
        name: p.description,
        power_w: p.power_w,
        quantity: p.quantity,
        brand: p.brand
    }))

    const solarInverters: SolarInverter[] = inverters.map((i, idx) => ({
        id: `inverter-${idx}`,
        name: i.description,
        power_kw: i.power_kw,
        quantity: i.quantity,
        brand: i.brand
    }))

    // Use solar-calculator for ratio analysis
    const ratioResult = calculatePanelToInverterRatio(solarPanels, solarInverters)

    // Calculate totals (keep compatibility with existing UI)
    const totalPanels = Number(data.metadata?.total_panels || panels.reduce((sum, p) => sum + p.quantity, 0))
    const totalInverters = Number(data.metadata?.total_inverters || inverters.reduce((sum, i) => sum + i.quantity, 0))
    const totalPowerKWp = ratioResult.totalPanelPowerKw
    const totalInverterPowerKW = ratioResult.totalInverterPowerKw
    const panelToInverterRatio = ratioResult.ratio

    // Determine structure type
    const structureType = String(data.metadata?.estrutura || 'Não especificado')
    const distributionCenter = String(data.metadata?.centro_distribuicao || 'Não especificado')

    return (
        <Container className="divide-y p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🔆</span>
                    <Heading level="h2">Composição do Kit Solar</Heading>
                </div>
                <div className="flex items-center gap-2">
                    <Badge color="blue">{totalPowerKWp.toFixed(2)} kWp</Badge>
                    <Button
                        size="small"
                        variant="secondary"
                        onClick={() => setShowCalculator(!showCalculator)}
                    >
                        {showCalculator ? '📊 Ocultar' : '🔧 Calculadora'}
                    </Button>
                </div>
            </div>

            {/* System Overview */}
            <div className="p-6 bg-ui-bg-subtle">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                        icon="☀️"
                        label="Total de Painéis"
                        value={totalPanels}
                        unit="unidades"
                    />
                    <MetricCard
                        icon="⚡"
                        label="Total de Inversores"
                        value={totalInverters}
                        unit="unidades"
                    />
                    <MetricCard
                        icon="🔋"
                        label="Potência do Sistema"
                        value={totalPowerKWp.toFixed(2)}
                        unit="kWp"
                        highlight
                    />
                    <MetricCard
                        icon="📊"
                        label="Ratio Painel/Inversor"
                        value={panelToInverterRatio.toFixed(2)}
                        unit="x"
                        status={getRatioStatus(ratioResult.status)}
                    />
                </div>
            </div>

            {/* Panels Section */}
            {panels.length > 0 && (
                <div className="p-6">
                    <Heading level="h3" className="mb-4">☀️ Painéis Solares</Heading>
                    <div className="space-y-3">
                        {panels.map((panel, index) => (
                            <ComponentCard
                                key={`panel-${index}`}
                                icon="☀️"
                                brand={panel.brand}
                                description={panel.description}
                                quantity={panel.quantity}
                                specs={[
                                    { label: 'Potência', value: `${panel.power_w}W` },
                                    { label: 'Total', value: `${panel.power_w * panel.quantity}W` }
                                ]}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Inverters Section */}
            {inverters.length > 0 && (
                <div className="p-6">
                    <Heading level="h3" className="mb-4">⚡ Inversores</Heading>
                    <div className="space-y-3">
                        {inverters.map((inverter, index) => (
                            <ComponentCard
                                key={`inverter-${index}`}
                                icon="⚡"
                                brand={inverter.brand}
                                description={inverter.description}
                                quantity={inverter.quantity}
                                specs={[
                                    { label: 'Potência', value: `${inverter.power_kw}kW` },
                                    { label: 'Total', value: `${inverter.power_kw * inverter.quantity}kW` }
                                ]}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Batteries Section */}
            {batteries.length > 0 && (
                <div className="p-6">
                    <Heading level="h3" className="mb-4">🔋 Baterias</Heading>
                    <div className="space-y-3">
                        {batteries.map((battery, index) => (
                            <ComponentCard
                                key={`battery-${index}`}
                                icon="🔋"
                                brand={battery.brand || 'N/A'}
                                description={battery.description || 'Bateria'}
                                quantity={battery.quantity || 1}
                                specs={[
                                    ...(battery.capacity_ah ? [{ label: 'Capacidade', value: `${battery.capacity_ah}Ah` }] : []),
                                    ...(battery.voltage_v ? [{ label: 'Tensão', value: `${battery.voltage_v}V` }] : [])
                                ]}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Installation Info */}
            <div className="p-6 bg-ui-bg-subtle">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                        icon="🏗️"
                        label="Tipo de Estrutura"
                        value={structureType}
                    />
                    <InfoItem
                        icon="📍"
                        label="Centro de Distribuição"
                        value={distributionCenter}
                    />
                </div>
            </div>

            {/* System Calculator */}
            {showCalculator && (
                <div className="p-6 border-t-4 border-blue-500 bg-blue-50">
                    <div className="flex items-center justify-between mb-4">
                        <Heading level="h3">🔧 Análise do Sistema</Heading>
                        <div className="flex gap-2">
                            <Button
                                size="small"
                                variant="secondary"
                                onClick={() => setShowDegradation(!showDegradation)}
                            >
                                {showDegradation ? '📊 Ocultar Degradação' : '📈 Ver Degradação 25 anos'}
                            </Button>
                            <Button
                                size="small"
                                variant="secondary"
                                onClick={() => setShowCompatibility(!showCompatibility)}
                            >
                                {showCompatibility ? '⚠️ Ocultar Avisos' : '⚠️ Ver Compatibilidade'}
                            </Button>
                            <Button
                                size="small"
                                variant="primary"
                                onClick={() => handleExportPDF(data)}
                            >
                                📄 Exportar PDF
                            </Button>
                        </div>
                    </div>
                    <SystemAnalysis
                        totalPowerKWp={totalPowerKWp}
                        totalInverterPowerKW={totalInverterPowerKW}
                        panelToInverterRatio={panelToInverterRatio}
                        totalPanels={totalPanels}
                        totalInverters={totalInverters}
                        selectedState={selectedState}
                        onStateChange={setSelectedState}
                        showDegradation={showDegradation}
                        showCompatibility={showCompatibility}
                        solarPanels={solarPanels}
                        solarInverters={solarInverters}
                    />
                </div>
            )}
        </Container>
    )
}

// Helper function for PDF export
function handleExportPDF(product: AdminProduct) {
    const printContent = document.querySelector('.solar-kit-analysis')
    if (!printContent) {
        alert('Nenhum conteúdo para exportar. Abra a calculadora primeiro.')
        return
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Análise Solar - ${product.title}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin: 20px 0; page-break-inside: avoid; }
                .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; }
                .chart { margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f0f0f0; }
                @media print { body { print-color-adjust: exact; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Análise de Sistema Solar Fotovoltaico</h1>
                <h2>${product.title}</h2>
                <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            ${printContent.innerHTML}
            <div class="footer" style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
                <p>Documento gerado por Yellow Solar Hub - Medusa B2B Platform</p>
            </div>
        </body>
        </html>
    `)

    printWindow.document.close()
    setTimeout(() => {
        printWindow.print()
        printWindow.close()
    }, 500)
}

// Helper Components

interface MetricCardProps {
    icon: string
    label: string
    value: string | number
    unit?: string
    highlight?: boolean
    status?: 'good' | 'warning' | 'error'
}

const MetricCard = ({ icon, label, value, unit, highlight, status }: MetricCardProps) => {
    const getStatusColor = () => {
        switch (status) {
            case 'good': return 'border-green-500 bg-green-50'
            case 'warning': return 'border-yellow-500 bg-yellow-50'
            case 'error': return 'border-red-500 bg-red-50'
            default: return highlight ? 'border-blue-500 bg-blue-50' : 'border-ui-border-base bg-ui-bg-base'
        }
    }

    return (
        <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{icon}</span>
                <span className="text-ui-fg-subtle text-xs">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold">{value}</span>
                {unit && <span className="text-ui-fg-subtle text-sm">{unit}</span>}
            </div>
        </div>
    )
}

interface ComponentCardProps {
    icon: string
    brand: string
    description: string
    quantity: number
    specs: Array<{ label: string; value: string }>
}

const ComponentCard = ({ icon, brand, description, quantity, specs }: ComponentCardProps) => (
    <div className="flex items-start gap-4 p-4 border border-ui-border-base rounded-lg hover:bg-ui-bg-subtle transition-colors">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
                <div>
                    <div className="font-semibold text-ui-fg-base">{brand}</div>
                    <div className="text-sm text-ui-fg-subtle">{description}</div>
                </div>
                <Badge color="blue">{quantity}x</Badge>
            </div>
            <div className="flex gap-4 mt-2">
                {specs.map((spec, index) => (
                    <div key={index} className="text-xs">
                        <span className="text-ui-fg-subtle">{spec.label}: </span>
                        <span className="font-medium">{spec.value}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

interface InfoItemProps {
    icon: string
    label: string
    value: string
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
    <div className="flex items-center gap-3 p-3 bg-ui-bg-base rounded-lg border border-ui-border-base">
        <span className="text-2xl">{icon}</span>
        <div>
            <div className="text-xs text-ui-fg-subtle">{label}</div>
            <div className="font-medium text-ui-fg-base">{value}</div>
        </div>
    </div>
)

interface SystemAnalysisProps {
    totalPowerKWp: number
    totalInverterPowerKW: number
    panelToInverterRatio: number
    totalPanels: number
    totalInverters: number
    selectedState: string
    onStateChange: (state: string) => void
    showDegradation: boolean
    showCompatibility: boolean
    solarPanels: SolarPanel[]
    solarInverters: SolarInverter[]
}

const SystemAnalysis = ({
    totalPowerKWp,
    totalInverterPowerKW,
    panelToInverterRatio,
    totalPanels,
    totalInverters,
    selectedState,
    onStateChange,
    showDegradation,
    showCompatibility,
    solarPanels,
    solarInverters
}: SystemAnalysisProps) => {
    // Use solar-calculator functions
    const ratioCalculation = calculatePanelToInverterRatio(solarPanels, solarInverters)
    const ratioStatus = getRatioStatus(ratioCalculation.status)

    // Estimate energy generation with selected state
    const energyEstimate = estimateEnergyGeneration({
        panels: solarPanels,
        inverters: solarInverters,
        location: { state: selectedState }
    })

    const energyProduction = {
        daily: energyEstimate.dailyKwh,
        monthly: energyEstimate.monthlyKwh,
        yearly: energyEstimate.yearlyKwh
    }

    // Validate system compatibility
    const compatibilityResult = validateSystemCompatibility({
        panels: solarPanels,
        inverters: solarInverters
    })

    // Project 25-year energy generation with degradation
    const degradationProjection = projectEnergyGeneration(energyEstimate.yearlyKwh, 25)

    // State options for dropdown
    const stateOptions = Object.entries(PEAK_SUN_HOURS_BY_STATE)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([code, hsp]) => ({
            value: code,
            label: `${code} - ${hsp.toFixed(1)}h HSP`
        }))

    return (
        <div className="space-y-4 solar-kit-analysis">
            {/* State Selector */}
            <div className="bg-white rounded-lg p-4 border">
                <div className="font-semibold mb-2">🗺️ Localização do Sistema</div>
                <div className="mb-2">
                    <label className="text-sm text-ui-fg-subtle mb-1 block">Estado (UF):</label>
                    <select
                        value={selectedState}
                        onChange={(e) => onStateChange(e.target.value)}
                        className="w-full border border-ui-border-base rounded px-3 py-2 text-sm"
                    >
                        {stateOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="text-xs text-ui-fg-muted">
                    HSP (Horas de Sol Pico): {PEAK_SUN_HOURS_BY_STATE[selectedState]?.toFixed(1)}h/dia
                </div>
            </div>

            {/* Ratio Analysis */}
            <div className="bg-white rounded-lg p-4 border">
                <div className="font-semibold mb-2">📊 Análise de Ratio Painel/Inversor</div>
                <div className="text-sm text-ui-fg-subtle mb-3">
                    Ratio atual: <span className="font-semibold text-ui-fg-base">{panelToInverterRatio.toFixed(2)}x</span>
                </div>
                <div className={`p-3 rounded ${ratioStatus === 'good' ? 'bg-green-100 text-green-800' :
                    ratioStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {ratioStatus === 'good' && '✅ Ratio excelente! Sistema bem dimensionado.'}
                    {ratioStatus === 'warning' && '⚠️ Ratio aceitável, mas pode ser otimizado.'}
                    {ratioStatus === 'error' && '❌ Ratio fora do ideal. Revisar dimensionamento.'}
                </div>
                <div className="mt-2 text-xs text-ui-fg-muted">
                    Ideal: 1.1x a 1.3x | Aceitável: 0.8x a 1.5x
                </div>
            </div>

            {/* Energy Production Estimate */}
            <div className="bg-white rounded-lg p-4 border">
                <div className="font-semibold mb-2">⚡ Estimativa de Geração ({selectedState})</div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600">{energyProduction.daily.toFixed(1)}</div>
                        <div className="text-xs text-ui-fg-subtle">kWh/dia</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-600">{energyProduction.monthly.toFixed(0)}</div>
                        <div className="text-xs text-ui-fg-subtle">kWh/mês</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-600">{energyProduction.yearly.toFixed(0)}</div>
                        <div className="text-xs text-ui-fg-subtle">kWh/ano</div>
                    </div>
                </div>
                <div className="mt-2 text-xs text-ui-fg-muted">
                    Baseado em {PEAK_SUN_HOURS_BY_STATE[selectedState]?.toFixed(1)}h HSP + PR 80% + Efic. Inv. 97.5%
                </div>
            </div>

            {/* Degradation Projection (25 years) */}
            {showDegradation && (
                <div className="bg-white rounded-lg p-4 border">
                    <div className="font-semibold mb-2">📈 Projeção de Geração (25 anos)</div>
                    <div className="text-xs text-ui-fg-muted mb-3">
                        Degradação anual: 0.5% (painéis Tier 1)
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                        <div className="grid grid-cols-12 gap-1 text-xs font-semibold text-ui-fg-subtle mb-2">
                            <div className="col-span-2">Ano</div>
                            <div className="col-span-4">Geração (kWh/ano)</div>
                            <div className="col-span-3">Degradação</div>
                            <div className="col-span-3">% Original</div>
                        </div>
                        {degradationProjection.map((proj) => (
                            <div key={proj.year} className="grid grid-cols-12 gap-1 text-xs py-1 border-b border-ui-border-base">
                                <div className="col-span-2 font-medium">{proj.year}</div>
                                <div className="col-span-4">{proj.kWh.toFixed(0)}</div>
                                <div className="col-span-3">{((1 - proj.degradationFactor) * 100).toFixed(2)}%</div>
                                <div className="col-span-3">
                                    <div className="bg-blue-100 h-2 rounded overflow-hidden">
                                        <div
                                            className="bg-blue-500 h-full"
                                            style={{ width: `${proj.degradationFactor * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                        <strong>Geração Total 25 anos:</strong> {degradationProjection.reduce((sum, p) => sum + p.kWh, 0).toFixed(0)} kWh
                        <br />
                        <strong>Média anual:</strong> {(degradationProjection.reduce((sum, p) => sum + p.kWh, 0) / 25).toFixed(0)} kWh/ano
                    </div>
                </div>
            )}

            {/* Compatibility Warnings */}
            {showCompatibility && (
                <div className="bg-white rounded-lg p-4 border">
                    <div className="font-semibold mb-2">⚠️ Análise de Compatibilidade</div>
                    <div className="mb-2">
                        <div className="text-sm font-medium mb-1">
                            Score de Compatibilidade: <span className={`${compatibilityResult.score >= 80 ? 'text-green-600' : compatibilityResult.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{compatibilityResult.score}/100</span>
                        </div>
                    </div>

                    {/* Critical Issues */}
                    {compatibilityResult.issues.length > 0 && (
                        <div className="mb-3">
                            <div className="text-xs font-semibold text-red-700 mb-1">🚨 Problemas Críticos:</div>
                            {compatibilityResult.issues.map((issue, idx) => (
                                <div key={idx} className="text-xs bg-red-50 border-l-4 border-red-500 p-2 mb-1">
                                    <strong>{issue.code}:</strong> {issue.message}
                                    {issue.severity && <span className="ml-2 text-red-600">(Severidade: {issue.severity})</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Warnings */}
                    {compatibilityResult.warnings.length > 0 && (
                        <div className="mb-3">
                            <div className="text-xs font-semibold text-yellow-700 mb-1">⚠️ Avisos:</div>
                            {compatibilityResult.warnings.map((warning, idx) => (
                                <div key={idx} className="text-xs bg-yellow-50 border-l-4 border-yellow-500 p-2 mb-1">
                                    <strong>{warning.code}:</strong> {warning.message}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* All Good */}
                    {compatibilityResult.issues.length === 0 && compatibilityResult.warnings.length === 0 && (
                        <div className="text-xs bg-green-50 border-l-4 border-green-500 p-3">
                            ✅ Sistema totalmente compatível! Nenhum problema detectado.
                        </div>
                    )}

                    {/* Ratio Details */}
                    <div className="mt-3 pt-3 border-t border-ui-border-base">
                        <div className="text-xs text-ui-fg-subtle">
                            <strong>Detalhes do Ratio:</strong><br />
                            {ratioCalculation.message}<br />
                            Status: {ratioCalculation.status} | Ratio: {ratioCalculation.ratio.toFixed(2)}x
                        </div>
                    </div>
                </div>
            )}

            {/* System Details */}
            <div className="bg-white rounded-lg p-4 border">
                <div className="font-semibold mb-2">🔍 Detalhes do Sistema</div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-ui-fg-subtle">Potência dos painéis:</span>
                        <span className="font-medium">{totalPowerKWp.toFixed(2)} kWp</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-ui-fg-subtle">Potência dos inversores:</span>
                        <span className="font-medium">{totalInverterPowerKW.toFixed(2)} kW</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-ui-fg-subtle">Quantidade de painéis:</span>
                        <span className="font-medium">{totalPanels} unidades</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-ui-fg-subtle">Quantidade de inversores:</span>
                        <span className="font-medium">{totalInverters} unidades</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-ui-fg-subtle">Painéis por inversor:</span>
                        <span className="font-medium">{(totalPanels / totalInverters).toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper Functions

/**
 * Map solar-calculator status to widget status
 * @param status - Status from calculatePanelToInverterRatio (excellent/good/acceptable/warning/error)
 * @returns Widget status (good/warning/error)
 */
function getRatioStatus(status: string): 'good' | 'warning' | 'error' {
    if (status === 'excellent' || status === 'good') return 'good'
    if (status === 'acceptable' || status === 'warning') return 'warning'
    return 'error'
}

// Widget Configuration - Show on product details pages for kits
export const config = defineWidgetConfig({
    zone: "product.details.after",
})

export default SolarKitComposition
