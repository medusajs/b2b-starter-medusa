import LocalizedClientLink from "@/modules/common/components/localized-client-link"

export default function SkeletonMegaMenu() {
  return (
    <LocalizedClientLink
      className="hover:text-ui-fg-base hover:bg-neutral-100 rounded-full px-3 py-2"
      href="/store"
    >
      Products
    </LocalizedClientLink>
  )
}
