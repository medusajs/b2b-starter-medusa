const SkeletonOrderSummary = () => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-gradient-to-r from-yello-gray-50 to-yello-gray-25 rounded-lg p-4 border border-yello-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-20 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full"></div>
                            <div className="w-8 h-8 bg-gradient-to-r from-yello-yellow-200 to-yello-orange-200 rounded-full"></div>
                        </div>
                        <div className="w-16 h-6 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full mb-2"></div>
                        <div className="w-24 h-3 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                    </div>
                ))}
            </div>

            <div className="border-t border-yello-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-32 h-5 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full"></div>
                    <div className="w-20 h-5 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full"></div>
                </div>

                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                            <div className="w-24 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full"></div>
                            <div className="w-16 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-yello-gray-200 mt-4 pt-4">
                    <div className="flex items-center justify-between">
                        <div className="w-20 h-5 bg-gradient-to-r from-yello-gray-400 to-yello-gray-300 rounded-full"></div>
                        <div className="w-24 h-6 bg-gradient-to-r from-yello-yellow-500 to-yello-orange-500 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SkeletonOrderSummary