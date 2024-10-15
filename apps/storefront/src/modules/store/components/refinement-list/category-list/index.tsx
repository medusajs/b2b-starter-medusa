import { HttpTypes } from "@medusajs/types"
import { Container, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useState } from "react"
import {} from "@medusajs/icons"
import { usePathname } from "next/navigation"

const CategoryList = ({
  categories,
  currentCategory,
}: {
  categories: HttpTypes.StoreProductCategory[]
  currentCategory?: HttpTypes.StoreProductCategory
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      }
      return [...prev, categoryId]
    })
  }

  const pathname = usePathname()

  const isCurrentCategory = (handle: string) => {
    return pathname === `/categories/${handle}`
  }

  useEffect(() => {
    let categoryId
    if (currentCategory && isCurrentCategory(currentCategory.handle)) {
      if (currentCategory.parent_category_id) {
        categoryId = currentCategory.parent_category_id
      } else {
        categoryId = currentCategory.id
      }

      setExpandedCategories([...expandedCategories, categoryId])
    }
  }, [pathname, currentCategory])

  return (
    <Container className="flex flex-col p-0 divide-y divide-neutral-200">
      <div className="flex justify-between items-center p-2">
        <Text className="text-sm">Categories</Text>
        <LocalizedClientLink className="text-xs text-neutral-500" href="/store">
          Clear
        </LocalizedClientLink>
      </div>
      <ul className="flex flex-col gap-2 text-sm p-2">
        {categories.map((category) => {
          if (category.parent_category_id) {
            return null
          }
          const children = category.category_children.map((child) => {
            return (
              <li key={child.id}>
                <LocalizedClientLink href={`/categories/${child.handle}`}>
                  {child.name}
                </LocalizedClientLink>
              </li>
            )
          })
          return (
            <li key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex justify-between items-center w-full"
              >
                {category.name}
              </button>
              {children && expandedCategories.includes(category.id) && (
                <ul className="pl-2">{children}</ul>
              )}
            </li>
          )
        })}
      </ul>
    </Container>
  )
}

export default CategoryList
