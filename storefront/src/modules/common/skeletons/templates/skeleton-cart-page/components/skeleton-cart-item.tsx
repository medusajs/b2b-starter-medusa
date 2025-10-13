const SkeletonCartItem = () => {
    return (
        <div className="w-full">
            <div className="flex flex-col small:flex-row small:items-center gap-4 p-4 bg-white border border-yello-gray-200 rounded-lg shadow-sm">
                {/* Product Image */}
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 small:w-20 small:h-20 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-lg animate-pulse"></div>
                </div>

                {/* Product Details */}
                <div className="flex flex-col flex-1 gap-2">
                    <div className="flex flex-col small:flex-row small:items-start small:justify-between gap-2">
                        {/* Title and Variant */}
                        <div className="flex flex-col gap-1 flex-1">
                            <div className="w-48 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full animate-pulse"></div>
                            <div className="w-32 h-3 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full animate-pulse"></div>
                        </div>

                        {/* Price */}
                        <div className="flex flex-col items-end gap-1">
                            <div className="w-20 h-5 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full animate-pulse"></div>
                            <div className="w-16 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    {/* Quantity and Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full animate-pulse"></div>
                                <div className="w-12 h-8 bg-gradient-to-r from-yello-gray-100 to-yello-gray-50 rounded border border-yello-gray-200 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full animate-pulse"></div>
                                </div>
                                <div className="w-8 h-8 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full animate-pulse"></div>
                            </div>

                            {/* Remove Button */}
                            <div className="w-8 h-8 bg-gradient-to-r from-yello-red-200 to-yello-red-100 rounded-full animate-pulse"></div>
                        </div>

                        {/* Subtotal */}
                        <div className="w-24 h-5 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SkeletonCartItem