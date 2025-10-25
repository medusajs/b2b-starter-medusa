const SkeletonCodeForm = () => {
  return (
    <div className="w-full flex flex-col animate-pulse">
      {/* Label */}
      <div className="bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 h-5 w-32 mb-3 rounded-full"></div>

      {/* Input and Button Container */}
      <div className="grid grid-cols-[1fr_100px] gap-x-3">
        {/* Input Field */}
        <div className="bg-gradient-to-r from-yello-gray-50 to-yello-gray-100 h-12 rounded-lg border border-yello-yellow-200 shadow-sm"></div>

        {/* Apply Button */}
        <div className="bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 h-12 rounded-lg shadow-sm"></div>
      </div>

      {/* Optional Help Text */}
      <div className="mt-2 bg-gradient-to-r from-yello-gray-100 to-yello-gray-50 h-3 w-48 rounded-full opacity-60"></div>
    </div>
  )
}

export default SkeletonCodeForm
