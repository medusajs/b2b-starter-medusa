"use client"

import { Sun } from "@medusajs/icons"
import { Heading } from "@medusajs/ui"
import Button from "@/modules/common/components/button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { t } from "@/lib/i18n/copy"
import { sendEvent } from "@/modules/analytics/events"

const Hero = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 relative overflow-hidden">
      {/* Enhanced background with glass effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        {/* Brand with glass effect */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md rounded-full border border-white/20 dark:border-zinc-800 shadow-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-zinc-50">Yello Solar Hub</span>
          </div>
        </div>

        {/* Main headline with gradient text */}
        <div className="space-y-8 mb-16">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 dark:text-zinc-50 leading-tight">
            Energia solar
            <span className="block bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              do seu jeito
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-zinc-300 max-w-4xl mx-auto leading-relaxed font-light">
            Compare kits, simule economia e acompanhe a instalação com suporte especialista.
          </p>
        </div>

        {/* CTA Buttons with glass effects */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          <LocalizedClientLink href="/solucoes" aria-label={t("home.hero_cta_primary")}
            onClick={() => sendEvent("cta_clicked", { component: "hero_primary_cta", key: "home.hero_cta_primary" })}>
            <Button className="bg-black hover:bg-gray-800 text-white px-10 py-5 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl backdrop-blur-sm">
              <Sun className="w-6 h-6 mr-3" />
              {t("home.hero_cta_primary")}
            </Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/store" aria-label={t("home.hero_cta_secondary")}
            onClick={() => sendEvent("cta_clicked", { component: "hero_secondary_cta", key: "home.hero_cta_secondary" })}>
            <Button variant="secondary" className="border-2 border-black/20 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md text-gray-900 dark:text-zinc-50 hover:bg-black hover:text-white px-10 py-5 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-lg">
              {t("home.hero_cta_secondary")}
            </Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/dimensionamento" aria-label="Simular agora"
            onClick={() => sendEvent("cta_clicked", { component: "hero_tertiary_cta", key: "home.hero_cta_simular" })}>
            <Button variant="secondary" className="bg-[var(--surface)]/80 border border-[var(--border)] text-zinc-900 dark:text-zinc-50 hover:shadow-lg rounded-full px-10 py-5 text-lg">
              Simular agora
            </Button>
          </LocalizedClientLink>
        </div>

        {/* Trust indicators with glass cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-zinc-800 shadow-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto mb-3"></div>
            <div className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-1">5 distribuidores certificados</div>
            <div className="text-xs text-gray-600 dark:text-zinc-400">Qualidade garantida</div>
          </div>
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-zinc-800 shadow-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto mb-3"></div>
            <div className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-1">713 produtos disponíveis</div>
            <div className="text-xs text-gray-600 dark:text-zinc-400">Ampla variedade</div>
          </div>
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-zinc-800 shadow-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mb-3"></div>
            <div className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-1">Garantia até 25 anos</div>
            <div className="text-xs text-gray-600 dark:text-zinc-400">Durabilidade máxima</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
