"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const MegaMenu = ({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<
    HttpTypes.StoreProductCategory["id"] | null
  >(null)

  const pathname = usePathname()

  const mainCategories = categories.filter(
    (category) => !category.parent_category_id
  )

  const getSubCategories = (categoryId: string) => {
    return categories.filter(
      (category) => category.parent_category_id === categoryId
    )
  }

  let menuTimeout: NodeJS.Timeout | null = null

  const handleMenuHover = () => {
    if (menuTimeout) {
      clearTimeout(menuTimeout)
    }
    setIsHovered(true)
  }

  const handleMenuLeave = () => {
    menuTimeout = setTimeout(() => {
      setIsHovered(false)
    }, 300)

    return () => {
      if (menuTimeout) {
        clearTimeout(menuTimeout)
      }
    }
  }

  let categoryTimeout: NodeJS.Timeout | null = null

  const handleCategoryHover = (categoryId: string) => {
    categoryTimeout = setTimeout(() => {
      setSelectedCategory(categoryId)
    }, 200)

    return () => {
      if (categoryTimeout) {
        clearTimeout(categoryTimeout)
      }
    }
  }

  const handleCategoryLeave = () => {
    if (categoryTimeout) {
      clearTimeout(categoryTimeout)
    }
  }

  useEffect(() => {
    setIsHovered(false)
  }, [pathname])

  return (
    <>
      <div
        onMouseEnter={handleMenuHover}
        onMouseLeave={handleMenuLeave}
        className="z-50"
      >
        <LocalizedClientLink
          className="hover:text-ui-fg-base hover:bg-neutral-100 rounded-full px-3 py-2"
          href="/store"
        >
          Products
        </LocalizedClientLink>
        {isHovered && (
          <div className="fixed left-0 right-0 top-[60px] flex gap-32 py-10 px-20 bg-white border-b border-neutral-200 ">
            <div className="flex flex-col gap-2">
              {mainCategories.map((category) => (
                <LocalizedClientLink
                  key={category.id}
                  href={`/categories/${category.handle}`}
                  className={clx(
                    "hover:bg-neutral-100 hover:cursor-pointer rounded-full px-3 py-2 w-fit font-medium",
                    selectedCategory === category.id && "bg-neutral-100"
                  )}
                  onMouseEnter={() => handleCategoryHover(category.id)}
                  onMouseLeave={handleCategoryLeave}
                >
                  {category.name}
                </LocalizedClientLink>
              ))}
            </div>
            {selectedCategory && (
              <div className="grid grid-cols-4 gap-16">
                {getSubCategories(selectedCategory).map((category) => (
                  <div key={category.id} className="flex flex-col gap-2">
                    <LocalizedClientLink
                      className="font-medium text-zinc-500 hover:underline"
                      href={`/categories/${category.handle}`}
                    >
                      {category.name}
                    </LocalizedClientLink>
                    <div className="flex flex-col gap-2">
                      {getSubCategories(category.id).map((subCategory) => (
                        <LocalizedClientLink
                          key={subCategory.id}
                          className="hover:underline"
                          href={`/categories/${subCategory.handle}`}
                        >
                          {subCategory.name}
                        </LocalizedClientLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {isHovered && (
        <div className="fixed inset-0 mt-[60px] blur-sm backdrop-blur-sm z-[-1]" />
      )}
    </>
  )
}

export default MegaMenu
