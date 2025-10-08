import { Container } from "@medusajs/ui"

const SkeletonCartItem = () => {
  return (
    <Container className="flex gap-4 w-full h-full items-center justify-between animate-pulse bg-gradient-to-r from-yello-yellow-50/50 to-yello-orange-50/50 border border-yello-yellow-100 rounded-lg p-4">
      <div className="flex gap-x-4 items-start">
        {/* Product Image */}
        <div className="bg-gradient-to-br from-yello-yellow-100 to-yello-orange-100 rounded-lg w-20 h-20 shadow-sm" />

        <div className="flex flex-col gap-y-2 justify-between min-h-full self-stretch">
          <div className="flex flex-col gap-y-1">
            {/* Product SKU/Reference */}
            <div className="w-16 h-3 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full" />
            {/* Product Name */}
            <div className="w-40 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full" />
            {/* Product Description */}
            <div className="w-32 h-3 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full" />
          </div>

          {/* Quantity and Variant Controls */}
          <div className="flex small:flex-row flex-col gap-2">
            <div className="flex gap-x-2">
              {/* Quantity Selector */}
              <div className="w-24 h-8 bg-gradient-to-r from-yello-yellow-200 to-yello-orange-200 rounded-full" />
              {/* Variant Selector */}
              <div className="w-20 h-8 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full" />
              {/* Remove Button */}
              <div className="w-8 h-8 bg-gradient-to-r from-yello-magenta-200 to-yello-magenta-100 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col items-end justify-between min-h-full self-stretch">
        <div className="w-20 h-5 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-full" />
        {/* Original Price (if discounted) */}
        <div className="w-16 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full opacity-60" />
      </div>
    </Container>
  )
}

export default SkeletonCartItem
