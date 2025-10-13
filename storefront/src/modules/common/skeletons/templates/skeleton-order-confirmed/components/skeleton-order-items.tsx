const SkeletonOrderItems = () => {
  return (
    <div className="flex flex-col gap-y-4 py-10">
      <div className="w-32 h-4 bg-gray-100"></div>
      <div className="flex flex-col gap-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-x-4 p-4 bg-gray-50">
            <div className="w-16 h-16 bg-gray-100"></div>
            <div className="flex flex-col gap-y-2 flex-1">
              <div className="w-3/4 h-4 bg-gray-100"></div>
              <div className="w-1/2 h-3 bg-gray-100"></div>
            </div>
            <div className="w-20 h-4 bg-gray-100"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SkeletonOrderItems