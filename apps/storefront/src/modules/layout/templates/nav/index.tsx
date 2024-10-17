import { getCustomer } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FilePlus from "@modules/common/icons/file-plus"
import LogoIcon from "@modules/common/icons/logo"
import User from "@modules/common/icons/user"
import CartButton from "@modules/layout/components/cart-button"
import { RequestQuotePrompt } from "@modules/quotes/components/request-quote-prompt"
import { Suspense } from "react"

export async function NavigationHeader() {
  const customer = await getCustomer().catch(() => null)

  return (
    <div className="sticky top-0 inset-x-0 group z-[1] bg-white text-zinc-900 small:p-4 p-2 text-sm border-b duration-200 border-ui-border-base">
      <header className="flex max-w-7xl relative small:mx-auto">
        <div className="container small:mx-auto flex justify-between items-center">
          <div className="flex items-center small:space-x-4">
            <LocalizedClientLink className="hover:text-ui-fg-base" href="/">
              <h1 className="text-base font-medium flex items-center">
                <LogoIcon className="inline mr-2" />
                Medusa B2B Starter
              </h1>
            </LocalizedClientLink>

            <nav>
              <ul className="space-x-4 hidden small:flex">
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
            <div className="relative mr-2 hidden small:inline-block">
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
                <span className="hidden small:inline-block">Quote</span>
              </button>
            </RequestQuotePrompt>

            <LocalizedClientLink
              className="hover:text-ui-fg-base"
              href="/account"
            >
              <button className="flex gap-1.5 items-center rounded-2xl bg-none shadow-none border-none hover:bg-neutral-100 px-2 py-1">
                <User />
                <span className="hidden small:inline-block">
                  {customer ? customer.first_name : "Log in"}
                </span>
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
