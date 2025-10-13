/**
 * System Sizing Component
 * Dimensionamento do sistema (inversores, strings, módulos)
 */

'use client'

import React from 'react'
import { useViability } from '../context/ViabilityContext'

export default function SystemSizing() {
    const { output } = useViability()

    if (!output) return null

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Dimensionamento do Sistema
            </h3>

            {/* Potência e Performance */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-600 mb-1">Potência</p>
                    <p className="text-2xl font-bold text-amber-900">{output.proposal_kwp} kWp</p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Geração/Ano</p>
                    <p className="text-2xl font-bold text-blue-900">{output.expected_gen_mwh_y} MWh</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">PR</p>
                    <p className="text-2xl font-bold text-green-900">{(output.pr * 100).toFixed(1)}%</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-600 mb-1">Oversizing</p>
                    <p className="text-2xl font-bold text-purple-900">{(output.oversizing_ratio * 100).toFixed(0)}%</p>
                </div>
            </div>

            {/* Inversores */}
            <div className="mb-6">
                <h4 className="font-semibold text-neutral-900 mb-3">Inversores</h4>
                <div className="space-y-2">
                    {output.inverters.map((inv, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                            <div>
                                <p className="font-medium text-neutral-900">{inv.model}</p>
                                <p className="text-sm text-neutral-600">
                                    {inv.phase === 'mono' ? 'Monofásico' : inv.phase === 'bi' ? 'Bifásico' : 'Trifásico'} • {inv.mppt} MPPT
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-sm font-medium">
                                {inv.quantity}x
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Strings e Módulos */}
            <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Strings e Módulos</h4>
                <div className="space-y-2">
                    {output.strings.map((str, idx) => (
                        <div key={idx} className="p-3 bg-neutral-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-neutral-900">{str.model}</p>
                                <span className="text-sm text-neutral-600">{str.power_wp}Wp</span>
                            </div>
                            <p className="text-sm text-neutral-600">{str.modules} módulos por string</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Perdas */}
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Perdas Estimadas</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                        <span className="text-red-600">Sujidade:</span>{' '}
                        <span className="font-medium text-red-900">{(output.losses.soiling * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                        <span className="text-red-600">Temperatura:</span>{' '}
                        <span className="font-medium text-red-900">{(output.losses.temp * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                        <span className="text-red-600">Ôhmica:</span>{' '}
                        <span className="font-medium text-red-900">{(output.losses.ohmic * 100).toFixed(1)}%</span>
                    </div>
                    {output.losses.shading && (
                        <div>
                            <span className="text-red-600">Sombreamento:</span>{' '}
                            <span className="font-medium text-red-900">{(output.losses.shading * 100).toFixed(1)}%</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
