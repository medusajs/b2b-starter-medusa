import Button from "@/modules/common/components/button"

const SkeletonButton = () => {
  return (
    <Button
      className="w-full min-h-10 animate-pulse bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 hover:from-yello-yellow-500 hover:to-yello-orange-500 border-0 shadow-sm"
      disabled
    />
  )
}

export default SkeletonButton
