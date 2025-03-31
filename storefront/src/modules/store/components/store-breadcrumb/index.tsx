import LocalizedClientLink from "@/modules/common/components/localized-client-link"

const StoreBreadcrumbItem = ({
  title,
  handle,
}: {
  title: string
  handle?: string
}) => {
  return (
    <li className="text-neutral-500">
      <LocalizedClientLink
        className="hover:text-neutral-900"
        href={handle ? `${handle}` : "/store"}
      >
        {title}
      </LocalizedClientLink>
    </li>
  )
}

const StoreBreadcrumb = () => {
  return (
    <ul className="flex items-center gap-x-3 text-sm">
      <StoreBreadcrumbItem title="Products" key="base" />
      <span className="text-neutral-500">{">"}</span>
      <StoreBreadcrumbItem title="All products" handle="/store" />
    </ul>
  )
}

export default StoreBreadcrumb
