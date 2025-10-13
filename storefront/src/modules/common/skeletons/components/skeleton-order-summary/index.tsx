import repeat from "@/lib/util/repeat"
import { Container } from "@medusajs/ui"
import SkeletonButton from "@/modules/skeletons/components/skeleton-button"
import SkeletonCartTotals from "@/modules/skeletons/components/skeleton-cart-totals"

const SkeletonOrderSummary = () => {
  return (
    <Container className="grid-cols-1 bg-gradient-to-br from-yello-yellow-50/30 to-yello-orange-50/30 border border-yello-yellow-100 rounded-lg p-6 shadow-sm">
      <SkeletonCartTotals header={false} />
      <div className="mt-6 flex flex-col gap-y-3">
        {/* Action Buttons */}
        <SkeletonButton />
        {/* Secondary Actions */}
        {repeat(2).map((index) => (
          <div key={index} className="h-10 bg-gradient-to-r from-yello-gray-100 to-yello-gray-50 rounded-full animate-pulse border border-yello-gray-200" />
        ))}
      </div>

      {/* Additional B2B Elements */}
      <div className="mt-6 pt-4 border-t border-yello-yellow-100">
        <div className="space-y-3">
          {/* Company Info */}
          <div className="h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full w-3/4" />
          {/* Approval Status */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-full" />
            <div className="h-3 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full w-24" />
          </div>
        </div>
      </div>
    </Container>
  )
}

export default SkeletonOrderSummary
