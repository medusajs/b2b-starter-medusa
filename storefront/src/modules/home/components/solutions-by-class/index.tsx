"use client"

import { Buildings, Bolt, Sun, Users } from "@medusajs/icons"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { sendEvent } from "@/modules/analytics/events"
import { t } from "@/lib/i18n/copy"

const CLASSES = [
  {
    id: "residencial-b1",
    title: t("solutions.card_b1_title"),
    description: t("solutions.card_b1_desc"),
    icon: Sun,
    modalidades: ["on-grid", "híbrido"],
    cta: t("solutions.cta_b1"),
    href: "/solucoes?classe=residencial-b1",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "rural-b2",
    title: t("solutions.card_b2_title"),
    description: t("solutions.card_b2_desc"),
    icon: Bolt,
    modalidades: ["off-grid", "híbrido"],
    cta: t("solutions.cta_b2"),
    href: "/solucoes?classe=rural-b2",
    color: "from-green-500 to-green-600",
  },
  {
    id: "comercial-b3",
    title: t("solutions.card_b3_title"),
    description: t("solutions.card_b3_desc"),
    icon: Buildings,
    modalidades: ["on-grid", "EaaS"],
    cta: t("solutions.cta_b3"),
    href: "/solucoes?classe=comercial-b3",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: "condominios",
    title: t("solutions.card_gc_title"),
    description: t("solutions.card_gc_desc"),
    icon: Users,
    modalidades: ["geração compartilhada"],
    cta: t("solutions.cta_gc"),
    href: "/solucoes?classe=condominios",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "industria",
    title: t("solutions.card_ind_title"),
    description: t("solutions.card_ind_desc"),
    icon: Buildings,
    modalidades: ["EaaS", "PPA"],
    cta: t("solutions.cta_ind"),
    href: "/account/quotes?tipo=enterprise",
    color: "from-red-500 to-red-600",
  },
]

export default function SolutionsByClass() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-950 dark:to-zinc-900 py-24">
      <div className="content-container">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full border border-yellow-200/50 mb-6">
            <Sun className="w-4 h-4 text-yellow-600" />
            <Text className="text-yellow-700 text-sm uppercase tracking-wider font-semibold">
              {t("home.solutions_title")}
            </Text>
          </div>
          <Heading level="h2" className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Energia solar para
            <span className="block bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              cada necessidade
            </span>
          </Heading>
          <Text className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t("home.solutions_sub")}
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CLASSES.map((classe) => {
            const Icon = classe.icon
            return (
              <LocalizedClientLink
                key={classe.id}
                href={classe.href}
                className="group"
                aria-label={`${classe.title} — ${classe.description}`}
                data-testid={`class-card-${classe.id}`}
                onClick={() =>
                  sendEvent("solutions_class_clicked", {
                    id: classe.id,
                    href: classe.href,
                    key: "home.solutions_title",
                  })
                }
              >
                <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/90 dark:hover:bg-zinc-900/70 border border-white/20 dark:border-zinc-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col group-hover:scale-[1.02]">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <Heading level="h3" className="text-2xl font-bold text-gray-900 dark:text-zinc-50 mb-3">
                    {classe.title}
                  </Heading>

                  <Text className="text-gray-600 dark:text-zinc-300 mb-6 flex-grow leading-relaxed">{classe.description}</Text>

                  <div className="flex flex-wrap gap-3 mb-6">
                    {classe.modalidades.map((mod) => (
                      <span key={mod} className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm rounded-full border border-gray-300/50">
                        {mod}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <Text className="text-gray-900 dark:text-zinc-50 font-semibold group-hover:text-yellow-600 transition-colors">
                      {classe.cta}
                    </Text>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>
    </div>
  )
}
