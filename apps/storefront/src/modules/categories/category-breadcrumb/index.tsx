import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import type { JSX } from "react";

const CategoryBreadcrumbItem = ({
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
        href={handle ? `/categories/${handle}` : "/store"}
      >
        {title}
      </LocalizedClientLink>
    </li>
  )
}

const CategoryBreadcrumb = ({
  category,
}: {
  category: HttpTypes.StoreProductCategory
}) => {
  const generateParentBreadcrumbs = (
    currentCategory: HttpTypes.StoreProductCategory,
    breadcrumbs: JSX.Element[] = []
  ): JSX.Element[] => {
    if (currentCategory.parent_category) {
      breadcrumbs.unshift(
        <>
          <CategoryBreadcrumbItem
            title={currentCategory.parent_category.name}
            handle={currentCategory.parent_category.handle}
            key={currentCategory.parent_category.id}
          />
          <span className="text-neutral-500" key="separator-parent">
            {">"}
          </span>
        </>
      )

      return generateParentBreadcrumbs(
        currentCategory.parent_category,
        breadcrumbs
      )
    }

    return breadcrumbs
  }

  const parentBreadcrumbs = generateParentBreadcrumbs(category)

  return (
    <ul className="flex items-center gap-x-3 text-sm">
      <CategoryBreadcrumbItem title="Products" key="base" />
      <span className="text-neutral-500" key="separator-base">
        {">"}
      </span>
      {parentBreadcrumbs}
      <CategoryBreadcrumbItem
        title={category.name}
        handle={category.handle}
        key={category.id}
      />
    </ul>
  )
}

export default CategoryBreadcrumb
