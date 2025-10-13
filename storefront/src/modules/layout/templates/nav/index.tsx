import { retrieveCart } from "@/lib/data/cart"
import { retrieveCustomer } from "@/lib/data/customer"
import AccountButton from "@/modules/account/components/account-button"
import CartButton from "@/modules/cart/components/cart-button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import QuoteLink from "@/modules/layout/templates/nav/quote-link"
import LogoIcon from "@/modules/common/icons/logo"
import { MAIN_MENU } from "@/modules/layout/config"
import { MegaMenuWrapper } from "@/modules/layout/components/mega-menu"
import SkeletonAccountButton from "@/modules/skeletons/components/skeleton-account-button"
import SkeletonCartButton from "@/modules/skeletons/components/skeleton-cart-button"
import SkeletonMegaMenu from "@/modules/skeletons/components/skeleton-mega-menu"
import { ThemeToggle } from "@/components/theme"
import { SKUHistoryDropdown } from "@/lib/sku-analytics"
import { SKUAutocomplete } from "@/components/SKUAutocomplete"
import { Suspense } from "react"

export async function NavigationHeader() {
  const customer = await retrieveCustomer().catch(() => null)
  await retrieveCart().catch(() => null)

  return (
    <header className="sticky top-0 inset-x-0 group text-sm z-50 text-[var(--fg)] ysh-glass">
      <div className="flex w-full content-container relative small:mx-auto justify-between px-4 py-3 small:p-4">
        <div className="small:mx-auto flex justify-between items-center min-w-full">
          <div className="flex items-center gap-3 small:gap-4">
            <LocalizedClientLink className="hover:text-ui-fg-base flex items-center min-w-0" href="/">
              <h1 className="small:text-base text-sm font-medium flex items-center min-w-0">
                <LogoIcon width={100} height={31} className="inline mr-2 flex-shrink-0" />
                <span className="hidden md:inline-flex ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full whitespace-nowrap">Marketplace Solar</span>
              </h1>
            </LocalizedClientLink>

            <nav className="hidden small:block" aria-label="Navegação principal">
              <ul className="flex gap-2 small:gap-4 items-center">
                <li>
                  <Suspense fallback={<SkeletonMegaMenu />}>
                    <MegaMenuWrapper />
                  </Suspense>
                </li>
                {MAIN_MENU.map((item) => (
                  <li key={item.href}>
                    <LocalizedClientLink className="hover:text-ui-fg-base hover:bg-neutral-100 rounded-full px-3 py-2 transition-colors" href={item.href}>
                      {item.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <nav className="flex justify-end items-center gap-2 small:gap-3" aria-label="Utilitários e conta">
            <div className="relative mr-2 hidden small:inline-flex">
              <SKUAutocomplete placeholder="Buscar por SKU ou produto..." className="w-40 lg:w-56" />
            </div>
            <div className="h-4 w-px bg-[var(--border)] hidden small:block" />
            <SKUHistoryDropdown />
            <QuoteLink />
            <ThemeToggle />
            <Suspense fallback={<SkeletonAccountButton />}>
              <AccountButton customer={customer} />
            </Suspense>
            <Suspense fallback={<SkeletonCartButton />}>
              <CartButton />
            </Suspense>
          </nav>
        </div>
      </div>
      <div className="ysh-divider-gradient"></div>
    </header>
  )
}





