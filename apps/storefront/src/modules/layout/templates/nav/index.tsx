import { getCustomer } from "@lib/data/customer"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FilePlus from "@modules/common/icons/file-plus"
import LogoIcon from "@modules/common/icons/logo"
import User from "@modules/common/icons/user"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import { RequestQuotePrompt } from "@modules/quotes/components/request-quote-prompt"
import { Suspense } from "react"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const customer = await getCustomer().catch(() => null)

  return (
    <div className="sticky top-0 inset-x-0 z-[5] group">
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
                {customer ? customer.first_name : "Log in"}
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
    <div className="sticky top-0 inset-x-0 group z-[1] bg-white text-zinc-900 p-4 text-sm border-b duration-200 border-ui-border-base">
      <header className="flex max-w-7xl relative mx-auto ">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <LocalizedClientLink className="hover:text-ui-fg-base" href="/">
              <h1 className="text-base font-medium flex items-center">
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
          <div className="flex items-center  gap-2">
            <div className="relative mr-2">
              <input
                type="text"
                placeholder="Search for products"
                className="bg-gray-100 text-white px-4 py-2 rounded-full pr-10 shadow-borders-base"
              />
            </div>

            <div className="h-4 w-px bg-neutral-300" />

            <RequestQuotePrompt>
              <button className="flex gap-1.5 items-center rounded-2xl bg-none shadow-none border-none hover:bg-neutral-100 px-2 py-1">
                <FilePlus />
                Quote
              </button>
            </RequestQuotePrompt>

            <LocalizedClientLink
              className="hover:text-ui-fg-base"
              href="/account"
            >
              <button className="flex gap-1.5 items-center rounded-2xl bg-none shadow-none border-none hover:bg-neutral-100 px-2 py-1">
                <User />
                {customer ? customer.first_name : "Log in"}
              </button>
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
