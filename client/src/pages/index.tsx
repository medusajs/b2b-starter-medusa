/**
 * 🏠 Home Page - Yello Solar Hub Client
 */

import { useSolarCalculator } from 'src/hooks/use-solar-calculator';
import { DimensionamentoCard } from 'src/components/solar';
import { useState } from 'react';
import { Hero } from 'src/components/ui/Hero';

export default function Home() {
    const { calculate, result, loading, error } = useSolarCalculator();
    const [consumo, setConsumo] = useState<number>(500);
    const [uf, setUf] = useState<string>('SP');

    const handleCalculate = () => {
        calculate({
            consumo_kwh_mes: consumo,
            uf,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 space-y-6">
                <Hero />
                <h1 className="text-4xl font-bold text-center mb-8 text-yellow-600">
                    ☀️ Yello Solar Hub
                </h1>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">Calcular Sistema Solar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Consumo mensal (kWh)
                            </label>
                            <input
                                type="number"
                                value={consumo}
                                onChange={(e) => setConsumo(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado (UF)
                            </label>
                            <select
                                value={uf}
                                onChange={(e) => setUf(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="SP">São Paulo</option>
                                <option value="RJ">Rio de Janeiro</option>
                                <option value="MG">Minas Gerais</option>
                                {/* Add more states */}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleCalculate}
                        disabled={loading}
                        className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 disabled:opacity-50"
                    >
                        {loading ? 'Calculando...' : 'Calcular'}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-800">{error.message}</p>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-6">
                        <DimensionamentoCard dimensionamento={result.dimensionamento} />
                        {/* Add other cards here */}
                    </div>
                )}
            </div>
        </div>
    );
}
