"use client"

import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import Button from "@/modules/common/components/button"

export default function OnboardingCTA() {
  return (
    <section className="py-16 px-6">
      <div className="content-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="rounded-2xl p-8 bg-[var(--surface)]/80 border border-[var(--border)] backdrop-blur-sm shadow-lg">
            <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
              Do interesse à proposta em minutos
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300 mb-6">
              Use nosso dimensionamento remoto (NASA/NREL + pvlib) para simular sua geração e economia — sem jargões. Depois, gere a proposta para assinatura digital.
            </p>
            <div className="flex gap-3">
              <LocalizedClientLink href="/dimensionamento">
                <Button className="rounded-full">Simular agora</Button>
              </LocalizedClientLink>
              <LocalizedClientLink href="/solucoes">
                <Button variant="secondary" className="rounded-full">Ver soluções</Button>
              </LocalizedClientLink>
            </div>
          </div>
          <div className="rounded-2xl p-6 bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20 border border-[var(--border)] backdrop-blur-md">
            <ul className="space-y-3 text-zinc-800 dark:text-zinc-200">
              <li>• Dados climáticos públicos (NASA POWER / NREL NSRDB)</li>
              <li>• Simulação pvlib + verificação PVWatts v8</li>
              <li>• TE/TUSD ANEEL e regras Lei 14.300</li>
              <li>• Resultados claros: kWp, kWh/ano, economia e payback</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

