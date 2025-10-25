import { Container } from "@medusajs/ui"

const SkeletonCompanyProfile = () => {
    return (
        <div className="animate-pulse">
            <Container className="bg-gradient-to-br from-yello-yellow-50 to-yello-orange-50 border border-yello-yellow-100 rounded-xl p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    {/* Company Logo */}
                    <div className="w-16 h-16 bg-gradient-to-br from-yello-yellow-200 to-yello-orange-200 rounded-full"></div>

                    <div className="flex-1">
                        {/* Company Name */}
                        <div className="w-48 h-6 bg-gradient-to-r from-yello-gray-300 to-yello-gray-200 rounded-full mb-2"></div>
                        {/* Company Type/Industry */}
                        <div className="w-32 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                    </div>

                    {/* Status Badge */}
                    <div className="px-3 py-1 bg-gradient-to-r from-yello-success/20 to-yello-success/10 border border-yello-success/30 rounded-full">
                        <div className="w-16 h-3 bg-gradient-to-r from-yello-success to-yello-success/80 rounded-full"></div>
                    </div>
                </div>

                {/* Company Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Contact Information */}
                    <div className="space-y-4">
                        <div className="w-32 h-4 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-full mb-3"></div>

                        <div className="space-y-3">
                            {/* Email */}
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gradient-to-r from-yello-magenta-300 to-yello-magenta-200 rounded-full"></div>
                                <div className="w-40 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gradient-to-r from-yello-magenta-300 to-yello-magenta-200 rounded-full"></div>
                                <div className="w-32 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                            </div>

                            {/* Address */}
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gradient-to-r from-yello-magenta-300 to-yello-magenta-200 rounded-full"></div>
                                <div className="w-48 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Business Information */}
                    <div className="space-y-4">
                        <div className="w-36 h-4 bg-gradient-to-r from-yello-yellow-300 to-yello-orange-300 rounded-full mb-3"></div>

                        <div className="space-y-3">
                            {/* CNPJ/Company ID */}
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gradient-to-r from-yello-magenta-300 to-yello-magenta-200 rounded-full"></div>
                                <div className="w-28 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                            </div>

                            {/* Credit Limit */}
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gradient-to-r from-yello-magenta-300 to-yello-magenta-200 rounded-full"></div>
                                <div className="w-24 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                            </div>

                            {/* Payment Terms */}
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gradient-to-r from-yello-magenta-300 to-yello-magenta-200 rounded-full"></div>
                                <div className="w-32 h-4 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-yello-yellow-100">
                    <div className="h-10 bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 rounded-lg flex-1"></div>
                    <div className="h-10 bg-gradient-to-r from-yello-gray-200 to-yello-gray-100 rounded-lg w-24"></div>
                </div>
            </Container>
        </div>
    )
}

export default SkeletonCompanyProfile
