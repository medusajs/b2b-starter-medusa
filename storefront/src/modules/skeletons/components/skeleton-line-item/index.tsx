const SkeletonLineItem = () => {
  return (
    <div className="flex flex-col gap-y-2 animate-pulse">
      <div className="flex items-start gap-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
        <div className="flex flex-col gap-y-1 flex-1">
          <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="w-20 h-6 bg-gray-200 rounded"></div>
        <div className="w-20 h-6 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

export default SkeletonLineItem
