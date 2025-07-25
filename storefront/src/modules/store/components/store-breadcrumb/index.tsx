import LocalizedClientLink from "@/modules/common/components/localized-client-link"

const StoreBreadcrumbItem = ({
  title,
  handle,
}: {
  title: string
  handle?: string
}) => {
  return (
    <li>
      <LocalizedClientLink
        className="hover:text-ui-fg-interactive"
        href={handle ? `${handle}` : "/store"}
      >
        {title}
      </LocalizedClientLink>
    </li>
  )
}

const StoreBreadcrumb = () => {
  return (
    <ul className="flex items-center gap-x-3 text-sm text-ui-fg-subtle">
      <StoreBreadcrumbItem title="Products" key="base" />
      <span>{">"}</span>
      <StoreBreadcrumbItem title="All products" handle="/store" />
    </ul>
  )
}

export default StoreBreadcrumb
