import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import { ArrowUpRightMini, ExclamationCircleSolid } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Footer from "@modules/layout/templates/footer"
import { NavigationHeader } from "@modules/layout/templates/nav"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <NavigationHeader />
      <div className="flex items-center text-neutral-50 justify-center p-4 text-center bg-neutral-900 gap-2 text-sm">
        <ExclamationCircleSolid className="inline" color="#A1A1AA" />
        <span>Favorites at a great price! For a limited time only</span>
        <span>·</span>

        <LocalizedClientLink
          className="group hover:text-ui-fg-interactive-hover text-ui-fg-interactive"
          href="/"
        >
          Go to Products
          <ArrowUpRightMini className="group-hover:text-ui-fg-interactive-hover inline text-ui-fg-interactive" />
        </LocalizedClientLink>
      </div>
      {props.children}
      <Footer />
    </>
  )
}
