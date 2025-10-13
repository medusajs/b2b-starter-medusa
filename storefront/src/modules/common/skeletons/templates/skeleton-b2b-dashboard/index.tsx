import repeat from "@/lib/util/repeat"
import SkeletonCompanyProfile from "../components/skeleton-company-profile"
import SkeletonApprovalCard from "../components/skeleton-approval-card"
import SkeletonOrderSummary from "../components/skeleton-order-summary"

const SkeletonB2BDashboard = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-yello-yellow-50/20 via-white to-yello-orange-50/20">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="h-8 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full w-64 mb-2"></div>
                    <div className="h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full w-96"></div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Company Profile */}
                    <div className="lg:col-span-1">
                        <SkeletonCompanyProfile />
                    </div>

                    {/* Middle Column - Recent Activity & Approvals */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {repeat(3).map((index) => (
                                <div key={index} className="bg-white/80 backdrop-blur-sm border border-yello-yellow-100 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-full"></div>
                                        <div className="w-20 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full"></div>
                                    </div>
                                    <div className="w-16 h-6 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full"></div>
                                </div>
                            ))}
                        </div>

                        {/* Pending Approvals */}
                        <div className="bg-white/80 backdrop-blur-sm border border-yello-yellow-100 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-6 h-6 bg-gradient-to-r from-yello-warning to-yello-warning/80 rounded-full"></div>
                                <div className="w-40 h-5 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full"></div>
                            </div>

                            <div className="space-y-4">
                                {repeat(2).map((index) => (
                                    <SkeletonApprovalCard key={index} />
                                ))}
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white/80 backdrop-blur-sm border border-yello-yellow-100 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-6 h-6 bg-gradient-to-r from-yello-magenta-300 to-yello-magenta-200 rounded-full"></div>
                                <div className="w-32 h-5 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full"></div>
                            </div>

                            <div className="space-y-3">
                                {repeat(3).map((index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yello-gray-50 to-yello-gray-25 rounded-lg border border-yello-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-yello-yellow-200 to-yello-orange-200 rounded-lg"></div>
                                            <div>
                                                <div className="w-24 h-4 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full mb-1"></div>
                                                <div className="w-16 h-3 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="w-16 h-4 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full mb-1"></div>
                                            <div className="w-12 h-3 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Order Summary */}
                <div className="mt-8">
                    <div className="bg-white/80 backdrop-blur-sm border border-yello-yellow-100 rounded-lg p-6 shadow-sm">
                        <div className="w-48 h-6 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-full mb-6"></div>
                        <SkeletonOrderSummary />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SkeletonB2BDashboard
