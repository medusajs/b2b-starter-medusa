import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { DocumentText, User } from "@medusajs/icons"
import { StoreRegion } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import { RequestQuotePrompt } from "@modules/quotes/components/request-quote-prompt"
import LogoIcon from "icons/logo"
import { getCustomer } from "@lib/data/customer"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const customer = await getCustomer().catch(() => null)

  return (
    <div className="sticky top-0 inset-x-0 z-1 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
              data-testid="nav-store-link"
            >
              Medusa Store
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              {process.env.NEXT_PUBLIC_FEATURE_SEARCH_ENABLED && (
                <LocalizedClientLink
                  className="hover:text-ui-fg-base"
                  href="/search"
                  scroll={false}
                  data-testid="nav-search-link"
                >
                  Search
                </LocalizedClientLink>
              )}
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/account"
                data-testid="nav-account-link"
              >
                {customer ? customer.first_name : "Login"}
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}

export async function NavigationHeader() {
  const customer = await getCustomer().catch(() => null)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative bg-white text-zinc-900 p-4 text-sm border-b duration-200 border-ui-border-base">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <LocalizedClientLink className="hover:text-ui-fg-base" href="/">
              <h1 className="text-md font-semibold">
                <LogoIcon className="inline mr-2" />
                Medusa B2B Starter
              </h1>
            </LocalizedClientLink>

            <nav>
              <ul className="flex space-x-4">
                <li>
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href="/store"
                  >
                    Products
                  </LocalizedClientLink>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products"
                className="bg-gray-100 text-white px-4 py-2 rounded-full pr-10"
              />
            </div>

            <RequestQuotePrompt>
              <Button
                variant="secondary"
                className="rounded-2xl bg-ui-bg-subtle"
              >
                <DocumentText />
                Quote
              </Button>
            </RequestQuotePrompt>

            <LocalizedClientLink
              className="hover:text-ui-fg-base"
              href="/account"
            >
              <Button
                variant="secondary"
                className="rounded-2xl bg-ui-bg-subtle"
              >
                <User />
                {customer ? customer.first_name : "Login"}
              </Button>
            </LocalizedClientLink>

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                ></LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </div>
      </header>
    </div>
  )
}
