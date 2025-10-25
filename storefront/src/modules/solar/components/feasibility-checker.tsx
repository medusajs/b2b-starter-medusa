"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, AlertTriangle, Zap, Home, Ruler } from "lucide-react";
import { validateSolarFeasibility, type SolarFeasibilityValidation } from "@/lib/data/solar-validation";

type Props = {
    cart_id: string;
    onValidationComplete?: (is_feasible: boolean) => void;
};

export function SolarFeasibilityChecker({ cart_id, onValidationComplete }: Props) {
    const [validation, setValidation] = useState<SolarFeasibilityValidation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleValidate = async () => {
        setLoading(true);
        setError(null);

        const result = await validateSolarFeasibility(cart_id);

        setLoading(false);

        if (result.data) {
            setValidation(result.data);
            onValidationComplete?.(result.data.is_feasible);
        } else {
            setError(result.error || "Erro desconhecido");
        }
    };

    return (
        <div className="space-y-4">
            {/* Botão de validação */}
            <Button
                onClick={handleValidate}
                disabled={loading}
                className="w-full"
                size="lg"
            >
                {loading ? (
                    <>
                        <span className="animate-spin mr-2">⚙️</span>
                        Validando viabilidade técnica...
                    </>
                ) : (
                    <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Validar Viabilidade do Projeto
                    </>
                )}
            </Button>

            {/* Erro genérico */}
            {error && (
                <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-red-900">Erro na Validação</h4>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Resultado da validação */}
            {validation && (
                <div className="space-y-4">
                    {/* Status geral */}
                    <Card className={`p-6 ${validation.is_feasible ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                        <div className="flex items-start gap-3">
                            {validation.is_feasible ? (
                                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <h3 className={`text-lg font-bold ${validation.is_feasible ? "text-green-900" : "text-red-900"}`}>
                                    {validation.message}
                                </h3>
                                {validation.is_feasible && (
                                    <p className="text-sm text-green-700 mt-1">
                                        Todos os requisitos técnicos foram atendidos. Você pode prosseguir com o checkout.
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Erros bloqueantes */}
                    {validation.blocking_errors.length > 0 && (
                        <Card className="p-4 bg-red-50 border-red-200">
                            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Problemas que impedem o checkout:
                            </h4>
                            <ul className="space-y-1">
                                {validation.blocking_errors.map((err, idx) => (
                                    <li key={idx} className="text-sm text-red-700">
                                        {err}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Warnings */}
                    {validation.warnings.length > 0 && (
                        <Card className="p-4 bg-yellow-50 border-yellow-200">
                            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Avisos importantes:
                            </h4>
                            <ul className="space-y-1">
                                {validation.warnings.map((warn, idx) => (
                                    <li key={idx} className="text-sm text-yellow-700">
                                        {warn}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Detalhes técnicos */}
                    <Card className="p-6">
                        <h4 className="font-semibold mb-4">Detalhes da Validação</h4>

                        <div className="grid gap-4 md:grid-cols-3">
                            {/* Irradiação */}
                            <div className="flex items-start gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${validation.validation_details.irradiation_check.passed
                                        ? "bg-green-100"
                                        : "bg-red-100"
                                    }`}>
                                    <Zap className={`h-5 w-5 ${validation.validation_details.irradiation_check.passed
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`} />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Irradiação Solar</p>
                                    <p className="font-semibold">
                                        {validation.validation_details.irradiation_check.value.toFixed(2)} kWh/m²/dia
                                    </p>
                                    <Badge
                                        variant={validation.validation_details.irradiation_check.passed ? "success" : "danger"}
                                        className="mt-1"
                                    >
                                        {validation.validation_details.irradiation_check.passed ? "✓ OK" : "✗ Baixa"}
                                    </Badge>
                                </div>
                            </div>

                            {/* Área */}
                            <div className="flex items-start gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${validation.validation_details.roof_area_check.passed
                                        ? "bg-green-100"
                                        : "bg-red-100"
                                    }`}>
                                    <Ruler className={`h-5 w-5 ${validation.validation_details.roof_area_check.passed
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`} />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Área de Telhado</p>
                                    <p className="font-semibold">
                                        {validation.validation_details.roof_area_check.available_m2} m²
                                    </p>
                                    <Badge
                                        variant={validation.validation_details.roof_area_check.passed ? "success" : "danger"}
                                        className="mt-1"
                                    >
                                        {validation.validation_details.roof_area_check.passed ? "✓ Suficiente" : "✗ Insuficiente"}
                                    </Badge>
                                </div>
                            </div>

                            {/* Capacidade */}
                            <div className="flex items-start gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${validation.validation_details.capacity_check.passed
                                        ? "bg-green-100"
                                        : "bg-red-100"
                                    }`}>
                                    <Home className={`h-5 w-5 ${validation.validation_details.capacity_check.passed
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`} />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Capacidade</p>
                                    <p className="font-semibold">
                                        {validation.validation_details.capacity_check.value_kwp} kWp
                                    </p>
                                    <Badge
                                        variant={validation.validation_details.capacity_check.passed ? "success" : "danger"}
                                        className="mt-1"
                                    >
                                        {validation.validation_details.capacity_check.passed ? "✓ Viável" : "✗ Muito baixa"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Complexidade de instalação */}
                        <div className="mt-6 pt-6 border-t">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Complexidade de Instalação</p>
                                    <p className="font-semibold mt-1 capitalize">
                                        {validation.validation_details.installation_complexity === "low" && "Baixa"}
                                        {validation.validation_details.installation_complexity === "medium" && "Média"}
                                        {validation.validation_details.installation_complexity === "high" && "Alta"}
                                        {validation.validation_details.installation_complexity === "very_high" && "Muito Alta"}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {validation.validation_details.crane_required && (
                                        <Badge variant="warning">🏗️ Requer Guindaste</Badge>
                                    )}
                                    {validation.validation_details.distance_km && validation.validation_details.distance_km > 100 && (
                                        <Badge variant="outline">📍 {validation.validation_details.distance_km}km</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}