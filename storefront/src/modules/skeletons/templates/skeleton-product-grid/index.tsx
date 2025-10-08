import repeat from "@/lib/util/repeat"
import SkeletonProductPreview from "@/modules/skeletons/components/skeleton-product-preview"

const SkeletonProductGrid = ({ count = 8 }: { count?: number }) => {
  const countToRender = Math.min(count, 8)

  return (
    <div className="bg-gradient-to-br from-yello-yellow-50/20 to-yello-orange-50/20 rounded-xl p-6 border border-yello-yellow-100/50">
      {/* Header */}
      <div className="mb-6">
        <div className="h-6 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-full w-48 mb-2"></div>
        <div className="h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full w-64"></div>
      </div>

      {/* Product Grid */}
      <ul
        className="grid grid-cols-1 small:grid-cols-3 medium:grid-cols-4 gap-4 flex-1"
        data-testid="products-list-loader"
      >
        {repeat(countToRender).map((index) => (
          <li key={index} className="transform hover:scale-105 transition-transform duration-200">
            <SkeletonProductPreview />
          </li>
        ))}
      </ul>

      {/* Loading Indicator */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yello-yellow-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-yello-orange-400 rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-2 h-2 bg-yello-magenta-400 rounded-full animate-bounce animation-delay-200"></div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonProductGrid
