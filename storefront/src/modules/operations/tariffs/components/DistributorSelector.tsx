/**
 * Distributor Selector Component
 * Seleção e informações da distribuidora
 */

'use client'

import React from 'react'

export default function DistributorSelector() {
    const distribuidoras = [
        { sigla: 'CPFL', nome: 'CPFL Paulista', estados: ['SP'], website: 'https://www.cpfl.com.br' },
        { sigla: 'ENEL_SP', nome: 'Enel São Paulo', estados: ['SP'], website: 'https://www.enel.com.br' },
        { sigla: 'ENEL_RJ', nome: 'Enel Rio de Janeiro', estados: ['RJ'], website: 'https://www.enel.com.br' },
        { sigla: 'CEMIG', nome: 'Cemig', estados: ['MG'], website: 'https://www.cemig.com.br' },
        { sigla: 'LIGHT', nome: 'Light', estados: ['RJ'], website: 'https://www.light.com.br' },
        { sigla: 'COPEL', nome: 'Copel', estados: ['PR'], website: 'https://www.copel.com' },
        { sigla: 'CELESC', nome: 'Celesc', estados: ['SC'], website: 'https://www.celesc.com.br' },
        { sigla: 'COELBA', nome: 'Coelba', estados: ['BA'], website: 'https://www.coelba.com.br' },
    ]

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Distribuidoras Atendidas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {distribuidoras.map((dist) => (
                    <div key={dist.sigla} className="p-4 bg-neutral-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-neutral-900">{dist.nome}</h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-900 text-xs font-medium rounded">
                                {dist.estados.join(', ')}
                            </span>
                        </div>
                        <a
                            href={dist.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Site oficial
                        </a>
                    </div>
                ))}
            </div>
        </div>
    )
}
