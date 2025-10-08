/**
 * 🏠 Solar CTA Hero Component
 * Call-to-action principal para calculadora solar na home
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { getSolarCalculatorUrl } from '@/modules/solar/integrations';

interface SolarCTAHeroProps {
    countryCode?: string;
}

export function SolarCTAHero({ countryCode = 'br' }: SolarCTAHeroProps) {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-2xl shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-dotted-pattern" />
            </div>

            <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:py-20">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white rounded-full shadow-lg">
                        <span className="text-5xl">☀️</span>
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
                        Descubra Quanto Você Pode Economizar com Energia Solar
                    </h2>

                    {/* Description */}
                    <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Dimensione seu sistema fotovoltaico gratuitamente e veja o retorno do seu investimento em minutos
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                            <div className="text-3xl mb-2">⚡</div>
                            <div className="text-white font-semibold text-sm">Cálculo Instantâneo</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                            <div className="text-3xl mb-2">💰</div>
                            <div className="text-white font-semibold text-sm">Análise Financeira</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                            <div className="text-3xl mb-2">📦</div>
                            <div className="text-white font-semibold text-sm">Kits Recomendados</div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href={getSolarCalculatorUrl(countryCode)}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold text-lg rounded-xl shadow-xl hover:bg-gray-50 hover:shadow-2xl transform hover:scale-105 transition-all"
                        >
                            <span>🧮</span>
                            <span>Calcular Meu Sistema</span>
                        </Link>

                        <Link
                            href={`/${countryCode}/solar-cv`}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-all"
                        >
                            <span>📸</span>
                            <span>Análise por Imagem</span>
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>100% Gratuito</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Sem Compromisso</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Resultado em 30 Segundos</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * 🔗 Solar Quick Link Component
 * Link compacto para calculadora em outras páginas
 */
export function SolarQuickLink({ countryCode = 'br' }: { countryCode?: string }) {
    return (
        <Link
            href={getSolarCalculatorUrl(countryCode)}
            className="group flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:shadow-lg transition-all"
        >
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ☀️
            </div>
            <div className="flex-1">
                <div className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    Calculadora Solar
                </div>
                <div className="text-sm text-gray-600">
                    Dimensione seu sistema fotovoltaico
                </div>
            </div>
            <svg
                className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </Link>
    );
}

/**
 * 📊 Solar Stats Component
 * Estatísticas/benefícios da energia solar
 */
export function SolarStats() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">95%</div>
                <div className="text-sm text-gray-600">Economia na Conta</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">25+</div>
                <div className="text-sm text-gray-600">Anos de Vida Útil</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">3-5</div>
                <div className="text-sm text-gray-600">Anos de Payback</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">0%</div>
                <div className="text-sm text-gray-600">Emissões CO₂</div>
            </div>
        </div>
    );
}
