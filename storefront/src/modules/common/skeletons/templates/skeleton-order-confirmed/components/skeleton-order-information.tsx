const SkeletonOrderInformation = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-10">
            <div className="flex flex-col gap-y-4">
                <div className="w-32 h-4 bg-gray-100"></div>
                <div className="w-full h-24 bg-gray-100"></div>
            </div>
            <div className="flex flex-col gap-y-4">
                <div className="w-32 h-4 bg-gray-100"></div>
                <div className="w-full h-24 bg-gray-100"></div>
            </div>
        </div>
    )
}

export default SkeletonOrderInformation