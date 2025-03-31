import repeat from "@/lib/util/repeat"
import { Container } from "@medusajs/ui"
import SkeletonButton from "@/modules/skeletons/components/skeleton-button"
import SkeletonCartTotals from "@/modules/skeletons/components/skeleton-cart-totals"

const SkeletonOrderSummary = () => {
  return (
    <Container className="grid-cols-1">
      <SkeletonCartTotals header={false} />
      <div className="mt-4 flex flex-col gap-y-3">
        {repeat(4).map((index) => (
          <SkeletonButton key={index} />
        ))}
      </div>
    </Container>
  )
}

export default SkeletonOrderSummary
