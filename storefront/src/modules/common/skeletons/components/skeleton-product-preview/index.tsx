import { Container } from "@medusajs/ui"

const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse">
      <Container className="aspect-[3/5] w-full bg-gradient-to-br from-yello-yellow-50 to-yello-orange-50 border border-yello-yellow-100 rounded-lg overflow-hidden shadow-sm">
        {/* Product Image Placeholder */}
        <div className="aspect-[4/5] bg-gradient-to-br from-yello-yellow-100 to-yello-orange-100 rounded-t-lg" />

        {/* Product Info Placeholder */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <div className="h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full w-3/4" />

          {/* Product Price */}
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-full w-16" />
            <div className="h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full w-12" />
          </div>

          {/* Product Rating/Stars */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gradient-to-r from-yello-yellow-200 to-yello-orange-200 rounded-full" />
            ))}
          </div>

          {/* Add to Cart Button */}
          <div className="h-8 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full w-full mt-3" />
        </div>
      </Container>
    </div>
  )
}

export default SkeletonProductPreview
