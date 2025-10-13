"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sun, TrendingUp, Leaf, Home } from "lucide-react";
import {
    calculateSolarSystem,
    type SolarCalculationInput,
    type SolarCalculationResult,
} from "@/lib/data/solar-calculator";

export function SolarCalculatorForm() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SolarCalculationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);

        const input: SolarCalculationInput = {
            consumption_kwh_month: Number(formData.get("consumption")),
            location: formData.get("location") as string,
            roof_type: formData.get("roof_type") as SolarCalculationInput["roof_type"],
            roof_area_m2: Number(formData.get("roof_area")) || undefined,
            building_type: (formData.get("building_type") as SolarCalculationInput["building_type"]) || "residencial",
        };

        try {
            const calculation = await calculateSolarSystem(input);
            setResult(calculation);
        } catch (err) {
            setError("Erro ao calcular sistema solar. Tente novamente.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sun className="h-5 w-5 text-yellow-500" />
                            Calcule Seu Sistema Solar
                        </CardTitle>
                        <CardDescription>
                            Preencha os dados abaixo para receber um dimensionamento personalizado
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="consumption">Consumo Mensal (kWh) *</Label>
                                <Input
                                    id="consumption"
                                    name="consumption"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Ex: 450"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Valor disponível na sua conta de luz
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Localização *</Label>
                                <Select name="location" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione sua cidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="São Paulo, SP">São Paulo, SP</SelectItem>
                                        <SelectItem value="Rio de Janeiro, RJ">Rio de Janeiro, RJ</SelectItem>
                                        <SelectItem value="Belo Horizonte, MG">Belo Horizonte, MG</SelectItem>
                                        <SelectItem value="Brasília, DF">Brasília, DF</SelectItem>
                                        <SelectItem value="Curitiba, PR">Curitiba, PR</SelectItem>
                                        <SelectItem value="Porto Alegre, RS">Porto Alegre, RS</SelectItem>
                                        <SelectItem value="Salvador, BA">Salvador, BA</SelectItem>
                                        <SelectItem value="Fortaleza, CE">Fortaleza, CE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="roof_type">Tipo de Telhado *</Label>
                                <Select name="roof_type" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ceramica">Cerâmica</SelectItem>
                                        <SelectItem value="fibrocimento">Fibrocimento</SelectItem>
                                        <SelectItem value="metalico">Metálico</SelectItem>
                                        <SelectItem value="laje">Laje</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="building_type">Tipo de Imóvel *</Label>
                                <Select name="building_type" defaultValue="residencial" required>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="residencial">Residencial</SelectItem>
                                        <SelectItem value="comercial">Comercial</SelectItem>
                                        <SelectItem value="industrial">Industrial</SelectItem>
                                        <SelectItem value="rural">Rural</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="roof_area">Área do Telhado (m²) - Opcional</Label>
                                <Input
                                    id="roof_area"
                                    name="roof_area"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Ex: 50"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Se não souber, deixe em branco
                                </p>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Calculando...
                                </>
                            ) : (
                                <>
                                    <Sun className="mr-2 h-4 w-4" />
                                    Calcular Sistema Solar
                                </>
                            )}
                        </Button>

                        {error && (
                            <div className="text-sm text-red-500 text-center">{error}</div>
                        )}
                    </CardContent>
                </Card>
            </form>

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <Card className="border-yellow-200 bg-yellow-50/50">
                        <CardHeader>
                            <CardTitle className="text-2xl">Sistema Recomendado</CardTitle>
                            <CardDescription>
                                Baseado no seu consumo de{" "}
                                <span className="font-semibold">{result.recommended_capacity_kwp} kWp</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Sun className="h-4 w-4" />
                                        <span className="text-sm">Capacidade</span>
                                    </div>
                                    <p className="text-3xl font-bold">{result.recommended_capacity_kwp} kWp</p>
                                    <p className="text-sm text-muted-foreground">
                                        {result.panel_quantity} painéis solares
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-sm">Investimento</span>
                                    </div>
                                    <p className="text-3xl font-bold">{formatCurrency(result.estimated_cost)}</p>
                                    <Badge variant="outline" className="bg-green-50">
                                        Payback em {result.payback_years} anos
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Leaf className="h-4 w-4" />
                                        <span className="text-sm">Economia Mensal</span>
                                    </div>
                                    <p className="text-3xl font-bold">{formatCurrency(result.monthly_savings)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {result.co2_offset_tons_year.toFixed(2)} ton CO₂/ano evitadas
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Geração Anual Estimada</CardTitle>
                            <CardDescription>
                                Com base na irradiação solar da sua região
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Geração anual</span>
                                    <span className="font-semibold">
                                        {result.annual_generation_kwh.toLocaleString("pt-BR")} kWh/ano
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Economia anual</span>
                                    <span className="font-semibold text-green-600">
                                        {formatCurrency(result.monthly_savings * 12)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Economia em 25 anos</span>
                                    <span className="font-semibold text-green-600">
                                        {formatCurrency(result.monthly_savings * 12 * 25)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {result.financing_options && result.financing_options.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Opções de Financiamento</CardTitle>
                                <CardDescription>
                                    Pague seu sistema solar em parcelas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {result.financing_options.map((option) => (
                                        <div
                                            key={option.installments}
                                            className="border rounded-lg p-4 space-y-2"
                                        >
                                            <p className="text-sm text-muted-foreground">
                                                {option.installments}x de
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {formatCurrency(option.monthly_payment)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Total: {formatCurrency(option.total_with_interest)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Produtos Recomendados</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result.recommended_products.panels.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Painéis Solares</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {result.recommended_products.panels.slice(0, 2).map((panel: any) => (
                                            <div key={panel.id} className="border rounded p-3 space-y-1">
                                                <p className="font-medium">{panel.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {panel.metadata?.capacidade_wp}Wp
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.recommended_products.inverters.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Inversores</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {result.recommended_products.inverters.slice(0, 2).map((inverter: any) => (
                                            <div key={inverter.id} className="border rounded p-3 space-y-1">
                                                <p className="font-medium">{inverter.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {inverter.metadata?.potencia_kw}kW
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button className="flex-1" size="lg">
                            <Home className="mr-2 h-4 w-4" />
                            Solicitar Visita Técnica
                        </Button>
                        <Button variant="outline" className="flex-1" size="lg">
                            Falar com Especialista
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}