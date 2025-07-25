import { listCategories } from "@/lib/data/categories"
import { listCollections } from "@/lib/data/collections"
import { Text } from "@medusajs/ui"

export default async function Footer() {
  const { collections } = await listCollections({
    offset: "0",
    limit: "6",
  })
  const product_categories = await listCategories({
    offset: 0,
    limit: 6,
  })

  return (
    <footer className="border-t border-ui-border-base bg-ui-bg-base w-full py-4">
      <div className="content-container flex flex-col w-full">
        <div className="flex w-full justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Equippy Limited. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  )
}
