import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { ProductSKU, ProductModel } from "@/modules/catalog/components/product-identifiers"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  // Extract metadata for manufacturer and model
  const manufacturer = (product.metadata?.manufacturer as string) || undefined
  const model = (product.metadata?.model as string) || undefined
  const sku = (product.metadata?.sku as string) || product.id

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 w-full">
        {/* Product Identifiers Section */}
        <div className="product-detail-identifiers">
          {manufacturer && model && (
            <div className="identifier-group">
              <label>Fabricante e Modelo</label>
              <ProductModel
                manufacturer={manufacturer}
                model={model}
                size="md"
                link={true}
              />
            </div>
          )}
          
          {sku && (
            <div className="identifier-group">
              <label>Código SKU</label>
              <ProductSKU
                sku={sku}
                size="md"
                copyable={true}
              />
            </div>
          )}
          
          {product.id && (
            <div className="identifier-group">
              <label>ID do Produto</label>
              <code className="text-sm font-mono px-2 py-1 bg-gray-100 rounded">
                {product.id}
              </code>
            </div>
          )}
        </div>

        <Heading
          level="h1"
          className="text-[2.5rem] leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="text-2xl text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.subtitle}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
