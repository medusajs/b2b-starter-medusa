import { listProducts } from "@/lib/data/products"
import { InventoryTable } from "@/modules/inventory/components/inventory-table"
import { Heading } from "@medusajs/ui"

export default async function Company({
  params,
}: {
  params: { countryCode: string }
}) {
  const { countryCode } = params
  const {
    response: { products },
  } = await listProducts({ countryCode })

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-y-4">
        <Heading level="h2" className="text-lg text-neutral-950">
          Inventory
        </Heading>
        <InventoryTable initialProducts={products} countryCode={countryCode} />
      </div>
    </div>
  )
}
