const SkeletonApprovalCard = () => {
    return (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yello-gray-50 to-yello-gray-25 rounded-lg border border-yello-gray-100">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yello-yellow-200 to-yello-orange-200 rounded-lg"></div>
                <div>
                    <div className="w-32 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full mb-1"></div>
                    <div className="w-24 h-3 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full mb-2"></div>
                    <div className="w-20 h-3 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-16 h-8 bg-gradient-to-r from-yello-warning to-yello-warning/80 rounded-full"></div>
                <div className="w-20 h-8 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-lg"></div>
            </div>
        </div>
    )
}

export default SkeletonApprovalCard