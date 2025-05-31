import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import Image from "next/image"
import MedusaCTA from "@/modules/layout/components/medusa-cta"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mb-2 w-full bg-white relative small:min-h-screen">
      <div className="h-16 bg-white">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink className="hover:text-ui-fg-base" href="/">
            <h1 className="text-base font-medium flex items-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={24}
                height={24}
                className="inline mr-2"
              />
              Batteries N&apos; Things
            </h1>
          </LocalizedClientLink>
        </nav>
      </div>
      <div className="relative bg-neutral-100" data-testid="checkout-container">
        {children}
      </div>
      <div className="py-4 w-full flex items-center justify-center">
        <MedusaCTA />
      </div>
    </div>
  )
}
