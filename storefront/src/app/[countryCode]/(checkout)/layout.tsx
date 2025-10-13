import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import LogoIcon from "@/modules/common/icons/logo"
import MedusaCTA from "@/modules/layout/components/medusa-cta"
import { t } from "@/lib/i18n/copy"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mb-2 w-full bg-[var(--bg)] relative small:min-h-screen">
      <div className="h-16 bg-[var(--surface)] border-b border-[var(--border)]">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink className="hover:text-ui-fg-base" href="/">
            <h1 className="text-base font-medium flex items-center">
              <LogoIcon width={100} height={31} className="inline mr-2" />
              <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">Marketplace Solar</span>
            </h1>
          </LocalizedClientLink>
        </nav>
      </div>
      <div className="bg-[var(--surface)] py-2 border-b border-[var(--border)]">
        <div className="content-container">
          <div className="flex justify-center space-x-4 text-sm">
            <span className="text-gray-500 dark:text-zinc-400">1. {t("checkout.steps.items")}</span>
            <span className="text-gray-500 dark:text-zinc-600">›</span>
            <span className="text-gray-500 dark:text-zinc-400">2. {t("checkout.steps.address")}</span>
            <span className="text-gray-500 dark:text-zinc-600">›</span>
            <span className="font-semibold text-amber-600">3. {t("checkout.steps.payment")} & Financiamento</span>
            <span className="text-gray-500 dark:text-zinc-600">›</span>
            <span className="text-gray-500 dark:text-zinc-400">4. {t("checkout.steps.done")}</span>
          </div>
        </div>
      </div>
      <div className="relative bg-neutral-100 dark:bg-zinc-900" data-testid="checkout-container">
        {children}
      </div>
      <div className="py-4 w-full flex items-center justify-center bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-4">
            <LocalizedClientLink href="/ferramentas/financiamento" className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
              {t("common.cta_simular")}
            </LocalizedClientLink>
            <LocalizedClientLink href="/suporte" className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
              {t("common.cta_falar_especialista")}
            </LocalizedClientLink>
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 text-center">
            <p>{t("checkout.steps.payment")} seguro • Dados protegidos (LGPD)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
