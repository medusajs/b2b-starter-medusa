/**
 * 🌞 Solar Calculator - Complete Integration
 * Componente completo de calculadora solar com formulário e resultados
 */

'use client';

import React, { useState } from 'react';
import type { SolarCalculationInput } from '@/types/solar-calculator';
import { useSolarCalculator, usePersistedCalculation } from '@/hooks/use-solar-calculator';
import { validateCalculationInput, sanitizeCalculationInput } from '@/lib/solar-calculator-client';
import { SolarResults } from '@/components/solar';
import { ESTADOS_BRASIL } from '@/types/solar-calculator';

export function SolarCalculatorComplete() {
    const { calculate, result, loading, error, reset } = useSolarCalculator({
        onSuccess: (calc) => {
            console.log('[Calculator] Cálculo concluído com sucesso');
            saveCalculation(calc);
        },
        onError: (err) => {
            console.error('[Calculator] Erro no cálculo:', err);
        },
    });

    const { saveCalculation, loadCalculation } = usePersistedCalculation();

    // Form state
    const [consumo, setConsumo] = useState<string>('450');
    const [uf, setUf] = useState<string>('SP');
    const [oversizing, setOversizing] = useState<number>(130);
    const [tipoSistema, setTipoSistema] = useState<'on-grid' | 'off-grid' | 'hibrido'>('on-grid');
    const [fase, setFase] = useState<'monofasico' | 'bifasico' | 'trifasico'>('bifasico');
    const [tipoTelhado, setTipoTelhado] = useState<string>('ceramico');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Carregar último cálculo (se houver)
    React.useEffect(() => {
        const lastCalc = loadCalculation();
        if (lastCalc && !result) {
            console.log('[Calculator] Carregando último cálculo salvo');
            // Nota: não podemos setar `result` diretamente, mas podemos mostrar um botão
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors([]);

        const input: Partial<SolarCalculationInput> = {
            consumo_kwh_mes: parseFloat(consumo),
            uf,
            oversizing_target: oversizing as any,
            tipo_sistema: tipoSistema,
            fase,
            tipo_telhado: tipoTelhado as any,
        };

        // Validar
        const validation = validateCalculationInput(input);
        if (!validation.valid) {
            setValidationErrors(validation.errors);
            return;
        }

        // Sanitizar e calcular
        const sanitized = sanitizeCalculationInput(input);
        await calculate(sanitized);
    };

    const handleReset = () => {
        reset();
        setValidationErrors([]);
    };

    const handleKitSelect = (kitId: string) => {
        console.log('[Calculator] Kit selecionado:', kitId);
        // TODO: Redirecionar para página do produto ou abrir modal de cotação
        alert(`Kit ${kitId} selecionado! Funcionalidade de cotação será implementada.`);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    ☀️ Calculadora Solar Fotovoltaica
                </h1>
                <p className="text-lg text-gray-600">
                    Dimensione seu sistema solar e descubra quanto você pode economizar
                </p>
            </div>

            {/* Formulário de Cálculo */}
            {!result && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <form onSubmit={handleCalculate} className="space-y-6">
                        {/* Erros de Validação */}
                        {validationErrors.length > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Erro(s) de validação:
                                        </h3>
                                        <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                            {validationErrors.map((err, i) => (
                                                <li key={i}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Consumo Mensal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    💡 Consumo Mensal (kWh)
                                </label>
                                <input
                                    type="number"
                                    value={consumo}
                                    onChange={(e) => setConsumo(e.target.value)}
                                    min="1"
                                    step="1"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="Ex: 450"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Verifique na sua conta de energia
                                </p>
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📍 Estado (UF)
                                </label>
                                <select
                                    value={uf}
                                    onChange={(e) => setUf(e.target.value)}
                                    required
                                    aria-label="Selecione o estado"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                >
                                    {ESTADOS_BRASIL.map((estado) => (
                                        <option key={estado} value={estado}>
                                            {estado}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Oversizing */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📊 Oversizing (%)
                                </label>
                                <select
                                    value={oversizing}
                                    onChange={(e) => setOversizing(parseInt(e.target.value))}
                                    aria-label="Oversizing"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                >
                                    <option value="100">100% (sem oversizing)</option>
                                    <option value="114">114% (compensar variação sazonal)</option>
                                    <option value="130">130% (recomendado)</option>
                                    <option value="145">145% (alto consumo)</option>
                                    <option value="160">160% (máximo permitido MMGD)</option>
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Compensação de perdas e variações
                                </p>
                            </div>

                            {/* Tipo de Sistema */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ⚡ Tipo de Sistema
                                </label>
                                <select
                                    value={tipoSistema}
                                    onChange={(e) => setTipoSistema(e.target.value as any)}
                                    aria-label="Tipo de sistema"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                >
                                    <option value="on-grid">On-Grid (Conectado à rede)</option>
                                    <option value="off-grid">Off-Grid (Isolado)</option>
                                    <option value="hibrido">Híbrido (Com baterias)</option>
                                </select>
                            </div>

                            {/* Fase */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🔌 Fase da Instalação
                                </label>
                                <select
                                    value={fase}
                                    onChange={(e) => setFase(e.target.value as any)}
                                    aria-label="Fase da instalação"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                >
                                    <option value="monofasico">Monofásico (127V ou 220V - 2 fios)</option>
                                    <option value="bifasico">Bifásico (220V - 3 fios)</option>
                                    <option value="trifasico">Trifásico (380V - 4 fios)</option>
                                </select>
                            </div>

                            {/* Tipo de Telhado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🏠 Tipo de Telhado
                                </label>
                                <select
                                    value={tipoTelhado}
                                    onChange={(e) => setTipoTelhado(e.target.value)}
                                    aria-label="Tipo de telhado"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                >
                                    <option value="ceramico">Cerâmico</option>
                                    <option value="metalico">Metálico</option>
                                    <option value="laje">Laje</option>
                                    <option value="fibrocimento">Fibrocimento</option>
                                </select>
                            </div>
                        </div>

                        {/* Botão de Calcular */}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Calculando...
                                    </span>
                                ) : (
                                    '🧮 Calcular Sistema Solar'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Erro */}
                    {error && (
                        <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{error.message}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Resultados */}
            {result && (
                <div>
                    <SolarResults
                        calculation={result}
                        onKitSelect={handleKitSelect}
                        onRecalculate={handleReset}
                    />
                </div>
            )}
        </div>
    );
}
