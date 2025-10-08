/**
 * ⚖️ Conformidade MMGD Card
 */

'use client';

import React from 'react';
import type { ConformidadeMMGD } from '@/types/solar-calculator';

interface ConformidadeCardProps {
    conformidade: ConformidadeMMGD;
}

export function ConformidadeCard({ conformidade }: ConformidadeCardProps) {
    const { conforme, alertas, observacoes } = conformidade;

    if (conforme && alertas.length === 0 && observacoes.length === 0) {
        return null; // Não exibir se estiver tudo OK
    }

    return (
        <div className={`rounded-lg shadow-md p-6 border-2 ${conforme
                ? 'bg-yellow-50 border-yellow-300'
                : 'bg-red-50 border-red-300'
            }`}>
            <h3 className="text-xl font-bold mb-2 flex items-center">
                <span className="text-2xl mr-2">{conforme ? '⚠️' : '🚫'}</span>
                <span className={conforme ? 'text-yellow-900' : 'text-red-900'}>
                    Conformidade MMGD (ANEEL 1.059/2023)
                </span>
            </h3>

            {!conforme && (
                <p className="text-red-800 mb-4 font-semibold">
                    ⚠️ Este sistema não está em conformidade com as regras de micro/minigeração distribuída.
                </p>
            )}

            {/* Alertas */}
            {alertas.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">⚠️ Alertas:</h4>
                    <ul className="space-y-2">
                        {alertas.map((alerta, index) => (
                            <li
                                key={index}
                                className="flex items-start bg-white rounded-lg p-3 border-l-4 border-red-400"
                            >
                                <span className="text-red-600 mr-2">•</span>
                                <span className="text-gray-800">{alerta}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Observações */}
            {observacoes.length > 0 && (
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2">ℹ️ Observações:</h4>
                    <ul className="space-y-2">
                        {observacoes.map((obs, index) => (
                            <li
                                key={index}
                                className="flex items-start bg-white rounded-lg p-3 border-l-4 border-blue-400"
                            >
                                <span className="text-blue-600 mr-2">•</span>
                                <span className="text-gray-800">{obs}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recomendação */}
            {!conforme && (
                <div className="mt-4 bg-white rounded-lg p-4 border border-red-200">
                    <p className="text-sm text-gray-700">
                        <strong>Recomendação:</strong> Ajuste os parâmetros do sistema para atender às regras da ANEEL.
                        Entre em contato com nossa equipe para orientação técnica.
                    </p>
                </div>
            )}
        </div>
    );
}
