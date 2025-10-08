/**
 * Manufacturer Filter Component
 * Filtro dropdown para selecionar fabricante no catálogo
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { clx } from '@medusajs/ui'

interface ManufacturerFilterProps {
    manufacturers: string[]
    selected: string | null
    onChange: (manufacturer: string | null) => void
    className?: string
}

export function ManufacturerFilter({
    manufacturers,
    selected,
    onChange,
    className
}: ManufacturerFilterProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Fecha ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearchQuery('')
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Filtra fabricantes pela busca
    const filteredManufacturers = manufacturers.filter(m =>
        m.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSelect = (manufacturer: string | null) => {
        onChange(manufacturer)
        setIsOpen(false)
        setSearchQuery('')
    }

    return (
        <div ref={dropdownRef} className={clx('relative', className)}>
            {/* Botão dropdown */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clx(
                    'flex items-center justify-between gap-2',
                    'w-full px-4 py-2.5',
                    'bg-white border border-gray-300 rounded-lg',
                    'hover:border-gray-400 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
            >
                <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className={selected ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                        {selected || 'Todos os fabricantes'}
                    </span>
                </span>

                <svg
                    className={clx(
                        'w-5 h-5 text-gray-400 transition-transform',
                        isOpen && 'rotate-180'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl">
                    {/* Campo de busca */}
                    <div className="p-3 border-b border-gray-200">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar fabricante..."
                            className={clx(
                                'w-full px-3 py-2',
                                'border border-gray-300 rounded',
                                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                                'placeholder:text-gray-400 text-sm'
                            )}
                            autoFocus
                        />
                    </div>

                    {/* Lista de fabricantes */}
                    <div className="max-h-80 overflow-y-auto">
                        {/* Opção "Todos" */}
                        <button
                            onClick={() => handleSelect(null)}
                            className={clx(
                                'w-full px-4 py-2.5 text-left',
                                'hover:bg-gray-50 transition-colors',
                                'border-b border-gray-100',
                                'flex items-center justify-between',
                                !selected && 'bg-blue-50 text-blue-700 font-medium'
                            )}
                        >
                            <span>Todos os fabricantes</span>
                            {!selected && (
                                <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>

                        {/* Fabricantes filtrados */}
                        {filteredManufacturers.length > 0 ? (
                            filteredManufacturers.map((manufacturer) => (
                                <button
                                    key={manufacturer}
                                    onClick={() => handleSelect(manufacturer)}
                                    className={clx(
                                        'w-full px-4 py-2.5 text-left',
                                        'hover:bg-gray-50 transition-colors',
                                        'border-b border-gray-100 last:border-b-0',
                                        'flex items-center justify-between',
                                        selected === manufacturer && 'bg-blue-50 text-blue-700 font-medium'
                                    )}
                                >
                                    <span>{manufacturer}</span>
                                    {selected === manufacturer && (
                                        <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                Nenhum fabricante encontrado
                            </div>
                        )}
                    </div>

                    {/* Rodapé com contador */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                        {selected ? (
                            <span>Filtrando por <strong>{selected}</strong></span>
                        ) : (
                            <span><strong>{manufacturers.length}</strong> fabricantes disponíveis</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManufacturerFilter
