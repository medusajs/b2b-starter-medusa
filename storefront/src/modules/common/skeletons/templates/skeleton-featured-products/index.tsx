import repeat from "@/lib/util/repeat"
import SkeletonProductPreview from "@/modules/skeletons/components/skeleton-product-preview"

const SkeletonFeaturedProducts = () => {
  return (
    <div className="flex flex-col gap-x-6 bg-neutral-100">
      <div className="content-container py-12 small:py-24 bg-neutral-100">
        <div className="flex justify-between mb-8">
          <div className="w-10 h-4 bg-neutral-200 rounded-md" />
          <div className="w-10 h-4 bg-neutral-200 rounded-md" />
        </div>

        <ul
          className="grid grid-cols-1 small:grid-cols-3 medium:grid-cols-4 gap-3 flex-1"
          data-testid="products-list-loader"
        >
          {repeat(4).map((index) => (
            <li key={index}>
              <SkeletonProductPreview />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SkeletonFeaturedProducts
