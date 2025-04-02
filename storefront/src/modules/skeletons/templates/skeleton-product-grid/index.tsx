import repeat from "@/lib/util/repeat"
import SkeletonProductPreview from "@/modules/skeletons/components/skeleton-product-preview"

const SkeletonProductGrid = ({ count = 8 }: { count?: number }) => {
  const countToRender = Math.min(count, 8)

  return (
    <ul
      className="grid grid-cols-1 small:grid-cols-3 medium:grid-cols-4 gap-3 flex-1"
      data-testid="products-list-loader"
    >
      {repeat(countToRender).map((index) => (
        <li key={index}>
          <SkeletonProductPreview />
        </li>
      ))}
    </ul>
  )
}

export default SkeletonProductGrid
