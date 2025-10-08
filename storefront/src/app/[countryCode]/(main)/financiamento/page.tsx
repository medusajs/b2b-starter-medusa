/**
 * Financing Page
 *
 * Credit simulation for solar systems
 * Integrates with BACEN rates and kit CAPEX
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import FinancingPageClient from './client-page'

export const metadata: Metadata = {
    title: 'Simulação de Financiamento | YSH Store',
    description: 'Simule o financiamento do seu sistema solar com taxas BACEN atualizadas e condições especiais.',
}

export default function FinancingPage({
    params,
    searchParams,
}: {
    params: { countryCode: string }
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const countryCode = params.countryCode

    // Validate country code
    if (!countryCode || countryCode.length !== 2) {
        notFound()
    }

    return <FinancingPageClient searchParams={searchParams} />
}