import Divider from "@/modules/common/components/divider"

const SkeletonCartTotals = ({ header = true }) => {
  return (
    <div className="flex flex-col animate-pulse">
      {header && (
        <div className="w-40 h-5 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-full mb-6"></div>
      )}

      {/* Subtotal */}
      <div className="flex items-center justify-between mb-3">
        <div className="w-20 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
        <div className="w-24 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full"></div>
      </div>

      {/* Shipping */}
      <div className="flex items-center justify-between mb-3">
        <div className="w-16 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
        <div className="w-20 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full"></div>
      </div>

      {/* Tax */}
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
        <div className="w-18 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full"></div>
      </div>

      {/* B2B Discount */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-yello-magenta-300 to-yello-magenta-200 rounded-full"></div>
          <div className="w-24 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
        </div>
        <div className="w-20 h-4 bg-gradient-to-r from-yello-magenta-300 to-yello-magenta-200 rounded-full"></div>
      </div>

      <Divider className="my-4 border-yello-yellow-100" />

      {/* Total */}
      <div className="flex items-center justify-between mb-2">
        <div className="w-16 h-6 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full font-semibold"></div>
        <div className="w-28 h-6 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full font-semibold"></div>
      </div>

      {/* Savings Indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="w-4 h-4 bg-gradient-to-r from-yello-success to-yello-success/80 rounded-full"></div>
        <div className="w-32 h-3 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
      </div>

      <Divider className="my-2 border-yello-yellow-100" />
    </div>
  )
}

export default SkeletonCartTotals
