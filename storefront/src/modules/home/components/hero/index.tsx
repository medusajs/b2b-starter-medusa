"use client"

import { Sun } from "@medusajs/icons"
import { Heading } from "@medusajs/ui"
import Button from "@/modules/common/components/button"
import Link from "next/link"
import { t } from "@/lib/i18n/copy"
import { sendEvent } from "@/modules/analytics/events"

const Hero = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        {/* Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Sun className="w-4 h-4 text-gray-900" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Yello Solar Hub</span>
          </div>
        </div>

        {/* Main headline */}
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
            Energia solar
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              do seu jeito
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Compare kits, simule economia e acompanhe a instalação com suporte especialista.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/solucoes" aria-label={t("home.hero_cta_primary")}
            onClick={() => sendEvent("cta_clicked", { component: "hero_primary_cta", key: "home.hero_cta_primary" })}>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-200 hover:scale-105 hover:shadow-xl">
              <Sun className="w-5 h-5 mr-2" />
              {t("home.hero_cta_primary")}
            </Button>
          </Link>
          <Link href="/store" aria-label={t("home.hero_cta_secondary")}
            onClick={() => sendEvent("cta_clicked", { component: "hero_secondary_cta", key: "home.hero_cta_secondary" })}>
            <Button variant="secondary" className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-200 hover:scale-105">
              {t("home.hero_cta_secondary")}
            </Button>
          </Link>
        </div>

        {/* Trust indicators - simplified */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>5 distribuidores certificados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>713 produtos disponíveis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Garantia até 25 anos</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
