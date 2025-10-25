const SkeletonProductPreview = () => {
    return (
        <div className="animate-pulse">
            <div className="aspect-square w-full bg-gray-100"></div>
            <div className="text-base-regular mt-2">
                <div className="w-3/4 h-4 bg-gray-100 mb-2"></div>
                <div className="w-1/2 h-3 bg-gray-100"></div>
            </div>
        </div>
    )
}

export default SkeletonProductPreview