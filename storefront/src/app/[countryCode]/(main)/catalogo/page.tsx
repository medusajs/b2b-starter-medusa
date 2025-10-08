/**
 * Catalog Page - Kit Selection
 * 
 * Displays solar kits filtered by viability analysis
 * Integrates with Finance Module for CAPEX calculation
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CatalogPageClient from './client-page'

export const metadata: Metadata = {
    title: 'Catálogo de Kits Solares | YSH Store',
    description: 'Selecione o kit solar ideal para seu projeto com recomendações inteligentes baseadas na sua análise de viabilidade.',
}

export default function CatalogPage({
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

    return <CatalogPageClient searchParams={searchParams} />
}
