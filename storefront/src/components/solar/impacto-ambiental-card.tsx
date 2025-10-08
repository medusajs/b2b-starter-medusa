/**
 * 🌍 Impacto Ambiental Card
 */

'use client';

import React from 'react';
import type { ImpactoAmbiental } from '@/types/solar-calculator';

interface ImpactoAmbientalCardProps {
    impacto: ImpactoAmbiental;
}

export function ImpactoAmbientalCard({ impacto }: ImpactoAmbientalCardProps) {
    const {
        co2_evitado_toneladas,
        arvores_equivalentes,
        carros_equivalentes,
    } = impacto;

    return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="text-2xl mr-2">🌍</span>
                Impacto Ambiental (25 anos)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                Contribua para um planeta mais sustentável gerando sua própria energia limpa
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CO2 Evitado */}
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-4xl mb-2">💨</div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                        {co2_evitado_toneladas.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">
                        toneladas de CO₂ evitadas
                    </div>
                </div>

                {/* Árvores Equivalentes */}
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-4xl mb-2">🌳</div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                        {Math.round(arvores_equivalentes)}
                    </div>
                    <div className="text-sm text-gray-600">
                        árvores plantadas equivalente
                    </div>
                </div>

                {/* Carros Equivalentes */}
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-4xl mb-2">🚗</div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                        {carros_equivalentes.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">
                        carros fora de circulação equivalente
                    </div>
                </div>
            </div>

            {/* Mensagem Inspiracional */}
            <div className="mt-4 bg-white/60 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-700">
                    ✨ <strong>Faça a diferença!</strong> Seu sistema solar contribui significativamente para a redução de emissões de gases de efeito estufa.
                </p>
            </div>
        </div>
    );
}
