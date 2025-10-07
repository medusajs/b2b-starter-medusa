"use client"

import { Sun } from "@medusajs/icons"
import { Heading } from "@medusajs/ui"
import Button from "@/modules/common/components/button"
import Link from "next/link"
import { t } from "@/lib/i18n/copy"
import { sendEvent } from "@/modules/analytics/events"

const Hero = () => {
  return (
    <div className="h-[85vh] w-full relative bg-gradient-to-br from-yellow-50 via-blue-50 to-green-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-400 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-green-400 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center text-center px-6 py-20 gap-8 max-w-6xl mx-auto">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
            <Sun className="w-6 h-6 text-gray-900" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Yello Solar Hub</span>
        </div>

        {/* Main Heading */}
        <div className="space-y-4">
          <p className="text-blue-600 text-sm uppercase tracking-wider font-semibold">
            {t("home.hero_title", "curto")}
          </p>

          <Heading level="h1" className="text-4xl md:text-6xl leading-tight text-gray-900 font-bold">
            {t("home.hero_title").split(" — ")[0]}
            <span className="block bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              — {t("home.hero_title").split(" — ")[1] || "do kit ao financiamento"}
            </span>
          </Heading>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("home.hero_sub")}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link href="/solucoes" aria-label={t("home.hero_cta_primary")}
            onClick={() => sendEvent("cta_clicked", { component: "hero_primary_cta", key: "home.hero_cta_primary" })}>
            <Button className="ysh-btn-primary text-lg px-8 py-4">
              <Sun className="w-5 h-5 mr-2" />
              {t("home.hero_cta_primary")}
            </Button>
          </Link>
          <Link href="/store" aria-label={t("home.hero_cta_secondary")}
            onClick={() => sendEvent("cta_clicked", { component: "hero_secondary_cta", key: "home.hero_cta_secondary" })}>
            <Button variant="secondary" className="ysh-btn-outline text-lg px-8 py-4">
              <Sun className="w-5 h-5 mr-2" />
              {t("home.hero_cta_secondary")}
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-gray-600">
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-4xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
            <div className="text-gray-600">Sistemas Instalados</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">2.5MWp</div>
            <div className="text-gray-600">Potência Total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">R$ 3.2M</div>
            <div className="text-gray-600">Economia Gerada</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
