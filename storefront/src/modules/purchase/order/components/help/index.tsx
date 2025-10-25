import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <Heading className="text-base-semi text-amber-900 mb-3">Precisa de ajuda?</Heading>
      <div className="text-sm text-neutral-700 my-2">
        <ul className="gap-y-2 flex flex-col">
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <LocalizedClientLink href="/contact" className="hover:text-amber-600 transition-colors">Contato & Suporte Técnico</LocalizedClientLink>
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <LocalizedClientLink href="/solucoes" className="hover:text-amber-600 transition-colors">Garantias & Políticas</LocalizedClientLink>
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <LocalizedClientLink href="/account" className="hover:text-amber-600 transition-colors">Rastreamento de Entrega</LocalizedClientLink>
          </li>
        </ul>
        <p className="mt-3 text-xs text-neutral-600 border-t border-amber-200 pt-3">
          💡 <strong>Dúvidas técnicas?</strong> Nossa equipe de especialistas em energia solar está pronta para ajudar com dimensionamento, instalação e homologação.
        </p>
      </div>
    </div>
  )
}

export default Help
