import { Container } from "@medusajs/ui"

const SkeletonApprovalCard = () => {
    return (
        <div className="animate-pulse">
            <Container className="bg-gradient-to-br from-yello-yellow-50 to-yello-orange-50 border border-yello-yellow-100 rounded-lg p-4 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Approval Icon */}
                        <div className="w-8 h-8 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-full"></div>

                        {/* Approval Title */}
                        <div className="w-32 h-5 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full"></div>
                    </div>

                    {/* Status Badge */}
                    <div className="px-3 py-1 bg-gradient-to-r from-yello-warning/20 to-yello-warning/10 border border-yello-warning/30 rounded-full">
                        <div className="w-16 h-3 bg-gradient-to-r from-yello-warning to-yello-warning/80 rounded-full"></div>
                    </div>
                </div>

                {/* Approval Details */}
                <div className="space-y-3 mb-4">
                    {/* Requester */}
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gradient-to-r from-yello-magenta-300 to-yello-magenta-200 rounded-full"></div>
                        <div className="w-24 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                        <div className="w-32 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gradient-to-r from-yello-magenta-300 to-yello-magenta-200 rounded-full"></div>
                        <div className="w-16 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                        <div className="w-20 h-5 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full"></div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gradient-to-r from-yello-magenta-300 to-yello-magenta-200 rounded-full"></div>
                        <div className="w-12 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                        <div className="w-24 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="w-full h-2 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full mb-2"></div>
                    <div className="w-3/4 h-2 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-full"></div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <div className="h-8 bg-gradient-to-r from-yello-success to-yello-success/80 rounded-lg flex-1"></div>
                    <div className="h-8 bg-gradient-to-r from-yello-error to-yello-error/80 rounded-lg flex-1"></div>
                    <div className="h-8 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-lg w-16"></div>
                </div>
            </Container>
        </div>
    )
}

export default SkeletonApprovalCard