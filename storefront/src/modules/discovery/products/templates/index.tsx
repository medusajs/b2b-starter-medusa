import { HttpTypes } from "@medusajs/types"
import ImageGallery from "@/modules/discovery/products/components/image-gallery"
import ProductActions from "@/modules/discovery/products/components/product-actions"
import ProductTabs from "@/modules/discovery/products/components/product-tabs"
import RelatedProducts from "@/modules/discovery/products/components/related-products"
import { SolarCalculatorBadge, SolarCalculatorSuggestion } from "@/modules/discovery/products/components/solar-integration"
import ProductInfo from "@/modules/discovery/products/templates/product-info"
import SkeletonRelatedProducts from "@/modules/common/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import React, { Suspense } from "react"
import ProductActionsWrapper from "./product-actions-wrapper"
import ProductFacts from "../components/product-facts"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const isSolarProduct = product.tags?.some(tag =>
    tag.value?.toLowerCase().includes('solar') ||
    tag.value?.toLowerCase().includes('kit')
  ) || false

  return (
    <div className="flex flex-col gap-y-2 my-2">
      {isSolarProduct && (
        <div className="content-container mb-4">
          <SolarCalculatorSuggestion productName={product.title || ''} countryCode={countryCode} />
        </div>
      )}
      <div
        className="content-container grid grid-cols-1 md:grid-cols-2 gap-2 w-full h-fit"
        data-testid="product-container"
      >
        <ImageGallery product={product} />
        <div className="flex flex-col bg-neutral-100 w-full gap-6 items-start justify-center small:p-20 p-6 h-full">
          {isSolarProduct && <SolarCalculatorBadge countryCode={countryCode} />}
          <ProductInfo product={product} />
          <Suspense
            fallback={<ProductActions product={product} region={region} />}
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>
          <ProductFacts product={product} />
        </div>
      </div>
      <div className="content-container">
        <ProductTabs product={product} />
      </div>
      <div
        className="content-container"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
