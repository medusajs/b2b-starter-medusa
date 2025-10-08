import repeat from "@/lib/util/repeat"
import { Container, Table } from "@medusajs/ui"
import SkeletonCartItem from "@/modules/skeletons/components/skeleton-cart-item"
import SkeletonOrderSummary from "@/modules/skeletons/components/skeleton-order-summary"

const SkeletonCartPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yello-yellow-50/30 via-white to-yello-orange-50/30">
      <div className="small:py-12 py-6">
        <div className="content-container" data-testid="cart-container">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yello-yellow-100/50 p-6">
            <div className="flex flex-col gap-y-8">
              {/* Header */}
              <div className="pb-4 border-b border-yello-yellow-100">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full animate-pulse"></div>
                  <div className="w-64 h-8 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="w-48 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full animate-pulse"></div>
              </div>

              {/* Cart Content */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                {/* Cart Items */}
                <div className="flex flex-col gap-y-4">
                  {/* B2B Company Info */}
                  <div className="bg-gradient-to-r from-yello-yellow-50 to-yello-orange-50 border border-yello-yellow-100 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-yello-magenta-300 to-yello-magenta-200 rounded-full"></div>
                      <div className="w-32 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full"></div>
                    </div>
                    <div className="w-40 h-3 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-4">
                    {repeat(3).map((index) => (
                      <SkeletonCartItem key={index} />
                    ))}
                  </div>

                  {/* Bulk Actions */}
                  <Container className="w-full h-16 animate-pulse bg-gradient-to-r from-yello-gray-50 to-yello-gray-100 flex justify-between items-center rounded-lg border border-yello-gray-200">
                    <div className="w-24 h-5 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full"></div>
                    <div className="flex gap-2">
                      <div className="w-16 h-8 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                      <div className="w-20 h-8 bg-gradient-to-r from-yello-magenta-200 to-yello-magenta-100 rounded-full"></div>
                    </div>
                  </Container>
                </div>

                {/* Order Summary Sidebar */}
                <div className="relative">
                  <div className="flex flex-col gap-y-6 sticky top-6">
                    <SkeletonOrderSummary />

                    {/* B2B Approval Status */}
                    <div className="bg-gradient-to-r from-yello-yellow-50 to-yello-orange-50 border border-yello-yellow-100 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-4 h-4 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-full animate-pulse"></div>
                        <div className="w-28 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-2 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                        <div className="w-3/4 h-2 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
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
