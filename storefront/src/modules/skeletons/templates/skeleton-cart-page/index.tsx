import repeat from "@/lib/util/repeat"
import { Container, Table } from "@medusajs/ui"
import SkeletonCartItem from "@/modules/skeletons/components/skeleton-cart-item"
import SkeletonOrderSummary from "@/modules/skeletons/components/skeleton-order-summary"

const SkeletonCartPage = () => {
  return (
    <div className="small:py-12 py-6 bg-neutral-100">
      <div className="content-container" data-testid="cart-container">
        <div>
          <div className="flex flex-col py-6 gap-y-6">
            <div className="pb-3 flex items-center">
              <div className="w-60 h-8 bg-gray-200 animate-pulse rounded-full" />
            </div>
            <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-2">
              <div className="flex flex-col gap-y-2">
                {repeat(4).map((index) => (
                  <SkeletonCartItem key={index} />
                ))}
                <Container className="w-full h-24 animate-pulse flex justify-between">
                  <div className="w-20 h-6 bg-neutral-200 rounded-full" />
                  <div className="w-20 h-6 bg-neutral-200 rounded-full" />
                </Container>
              </div>
              <div className="relative">
                <div className="flex flex-col gap-y-8 sticky top-20">
                  <SkeletonOrderSummary />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonCartPage
