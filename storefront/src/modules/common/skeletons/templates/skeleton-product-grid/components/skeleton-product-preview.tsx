const SkeletonProductPreview = () => {
    return (
        <div className="bg-white/80 backdrop-blur-sm border border-yello-yellow-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Product Image */}
            <div className="aspect-square w-full bg-gradient-to-br from-yello-gray-100 to-yello-gray-200 rounded-lg mb-4 animate-pulse"></div>

            {/* Product Info */}
            <div className="space-y-3">
                {/* Title */}
                <div className="h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full animate-pulse"></div>

                {/* Subtitle/Category */}
                <div className="h-3 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full w-3/4 animate-pulse"></div>

                {/* Price */}
                <div className="flex items-center justify-between">
                    <div className="h-5 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full w-20 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full w-16 animate-pulse"></div>
                </div>

                {/* Action Button */}
                <div className="h-10 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-lg animate-pulse"></div>
            </div>
        </div>
    )
}

export default SkeletonProductPreview