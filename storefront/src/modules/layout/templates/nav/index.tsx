import { retrieveCart } from "@/lib/data/cart"
import { retrieveCustomer } from "@/lib/data/customer"
import AccountButton from "@/modules/account/components/account-button"
import CartButton from "@/modules/cart/components/cart-button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import QuoteLink from "@/modules/layout/templates/nav/quote-link"
import LogoIcon from "@/modules/common/icons/logo"
import { MegaMenuWrapper } from "@/modules/layout/components/mega-menu"
import { RequestQuoteConfirmation } from "@/modules/quotes/components/request-quote-confirmation"
import { RequestQuotePrompt } from "@/modules/quotes/components/request-quote-prompt"
import SkeletonAccountButton from "@/modules/skeletons/components/skeleton-account-button"
import SkeletonCartButton from "@/modules/skeletons/components/skeleton-cart-button"
import SkeletonMegaMenu from "@/modules/skeletons/components/skeleton-mega-menu"
import { ThemeToggle } from "@/components/theme"
import { SKUHistoryDropdown } from "@/lib/sku-analytics"
import { SKUAutocomplete } from "@/components/SKUAutocomplete"
import { Suspense } from "react"

export async function NavigationHeader() {
  const customer = await retrieveCustomer().catch(() => null)
  const cart = await retrieveCart()

  return (
    <div className="sticky top-0 inset-x-0 group text-sm border-b duration-200 border-ui-border-base z-50 bg-[var(--bg)] text-[var(--fg)]">
      <header className="flex w-full content-container relative small:mx-auto justify-between px-4 py-3 small:p-4">
        <div className="small:mx-auto flex justify-between items-center min-w-full">
          <div className="flex items-center gap-3 small:gap-4">
            <LocalizedClientLink
              className="hover:text-ui-fg-base flex items-center min-w-0"
              href="/"
            >
              <h1 className="small:text-base text-sm font-medium flex items-center min-w-0">
                <LogoIcon className="inline mr-2 flex-shrink-0" />
                <span className="truncate">Yello Solar Hub</span>
                <span className="hidden md:inline-flex ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full whitespace-nowrap">Marketplace Solar</span>
              </h1>
            </LocalizedClientLink>

            <nav className="hidden small:block">
              <ul className="flex gap-2 small:gap-4">
                <li>
                  <Suspense fallback={<SkeletonMegaMenu />}>
                    <MegaMenuWrapper />
                  </Suspense>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base hover:bg-neutral-100 rounded-full px-3 py-2 transition-colors"
                    href="/solucoes"
                  >
                    Soluções
                  </LocalizedClientLink>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex justify-end items-center gap-2 small:gap-3 small:gap-3">
            <div className="relative mr-2 hidden small:inline-flex">
              <SKUAutocomplete
                placeholder="Buscar por SKU ou produto..."
                className="w-40 lg:w-56"
              />
            </div>

            <div className="h-4 w-px bg-[var(--border)] hidden small:block" />

            <SKUHistoryDropdown />

            {/* <QuoteLink /> */}

            <ThemeToggle />

            <Suspense fallback={<SkeletonAccountButton />}>
              <AccountButton customer={customer} />
            </Suspense>

            <Suspense fallback={<SkeletonCartButton />}>
              <CartButton />
            </Suspense>
          </div>
        </div>
      </header>
    </div>
  )
}
