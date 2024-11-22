import { Container } from "@medusajs/ui"

const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse">
      <Container className="aspect-[3/5] w-full bg-gray-100 bg-ui-bg-subtle" />
    </div>
  )
}

export default SkeletonProductPreview
