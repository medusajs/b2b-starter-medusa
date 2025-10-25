const SkeletonCompanyProfile = () => {
    return (
        <div className="bg-white/80 backdrop-blur-sm border border-yello-yellow-100 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-full"></div>
                <div>
                    <div className="w-32 h-5 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full mb-2"></div>
                    <div className="w-24 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="w-20 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full mb-2"></div>
                    <div className="w-full h-10 bg-gradient-to-r from-yello-gray-100 to-yello-gray-50 rounded-lg"></div>
                </div>

                <div>
                    <div className="w-16 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full mb-2"></div>
                    <div className="w-full h-10 bg-gradient-to-r from-yello-gray-100 to-yello-gray-50 rounded-lg"></div>
                </div>

                <div>
                    <div className="w-24 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full mb-2"></div>
                    <div className="w-full h-20 bg-gradient-to-r from-yello-gray-100 to-yello-gray-50 rounded-lg"></div>
                </div>
            </div>
        </div>
    )
}

export default SkeletonCompanyProfile