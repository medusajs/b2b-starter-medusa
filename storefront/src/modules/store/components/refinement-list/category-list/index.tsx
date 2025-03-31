import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import Radio from "@/modules/common/components/radio"
import SquareMinus from "@/modules/common/icons/square-minus"
import SquarePlus from "@/modules/common/icons/square-plus"
import { HttpTypes } from "@medusajs/types"
import { Container, Text } from "@medusajs/ui"
import { usePathname, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const CategoryList = ({
  categories,
  currentCategory,
}: {
  categories: HttpTypes.StoreProductCategory[]
  currentCategory?: HttpTypes.StoreProductCategory
}) => {
  const getCategoriesToExpand = useCallback(
    (category: HttpTypes.StoreProductCategory) => {
      const categoriesToExpand = [category.id]
      let current = category
      while (current.parent_category_id) {
        categoriesToExpand.push(current.parent_category_id)
        current = categories.find(
          (cat) => cat.id === current.parent_category_id
        ) as HttpTypes.StoreProductCategory
      }
      return categoriesToExpand
    },
    [categories]
  )

  const [expandedCategories, setExpandedCategories] = useState<string[]>(() =>
    currentCategory ? getCategoriesToExpand(currentCategory) : []
  )

  const pathname = usePathname()

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const searchParams = useSearchParams()

  const isCurrentCategory = (handle: string) =>
    pathname.split("/").slice(2).join("/") === `categories/${handle}`

  useEffect(() => {
    if (currentCategory) {
      const categoriesToExpand = getCategoriesToExpand(currentCategory)
      setExpandedCategories((prev) => {
        const newCategories = categoriesToExpand.filter(
          (cat) => !prev.includes(cat)
        )
        return newCategories.length ? [...prev, ...newCategories] : prev
      })
    }
  }, [currentCategory, getCategoriesToExpand])

  const getCategoryMarginLeft = useCallback(
    (category: HttpTypes.StoreProductCategory) => {
      let level = 0
      let currentCategory = category
      while (currentCategory.parent_category_id) {
        level++
        currentCategory = categories.find(
          (cat) => cat.id === currentCategory.parent_category_id
        ) as HttpTypes.StoreProductCategory
      }
      return level * 4
    },
    [categories]
  )

  const renderCategory = (category: HttpTypes.StoreProductCategory) => {
    const hasChildren = category.category_children.length > 0
    const isExpanded = expandedCategories.includes(category.id)
    const paddingLeft = getCategoryMarginLeft(category)

    return (
      <li key={category.id}>
        <div className={`flex items-center gap-2 mb-2 pl-${paddingLeft}`}>
          {hasChildren ? (
            <div className="flex items-center gap-2 hover:text-neutral-700">
              <button onClick={() => toggleCategory(category.id)}>
                {isExpanded ? (
                  <SquareMinus className="h-3 mx-1" />
                ) : (
                  <SquarePlus className="h-3 mx-1" />
                )}
              </button>
              <LocalizedClientLink
                href={`/categories/${category.handle}${
                  searchParams.size ? `?${searchParams.toString()}` : ""
                }`}
                className="flex gap-2 items-center hover:text-neutral-700"
              >
                {category.name} ({category.products?.length})
              </LocalizedClientLink>
            </div>
          ) : (
            <LocalizedClientLink
              href={`/categories/${category.handle}${
                searchParams.size ? `?${searchParams.toString()}` : ""
              }`}
              className="flex gap-2 items-center hover:text-neutral-700 text-start hover:cursor-pointer"
            >
              <Radio checked={isCurrentCategory(category.handle)} />
              {category.name} ({category.products?.length})
            </LocalizedClientLink>
          )}
        </div>
        {hasChildren && isExpanded && (
          <ul>
            {category.category_children.map((childId) => {
              const childCategory = categories.find(
                (cat) => cat.id === childId.id
              )
              return childCategory ? renderCategory(childCategory) : null
            })}
          </ul>
        )}
      </li>
    )
  }

  return (
    <Container className="flex flex-col p-0 divide-y divide-neutral-200">
      <div className="flex justify-between items-center p-3">
        <Text className="text-sm font-medium">Categories</Text>
        {pathname.includes("/categories") && (
          <LocalizedClientLink
            href="/store"
            className="text-xs text-neutral-500 hover:text-neutral-700"
          >
            Clear
          </LocalizedClientLink>
        )}
      </div>
      <ul className="flex flex-col gap-3 text-sm p-3 text-neutral-500">
        {categories
          .filter((cat) => cat.parent_category_id === null)
          .map(renderCategory)}
      </ul>
    </Container>
  )
}

export default CategoryList
