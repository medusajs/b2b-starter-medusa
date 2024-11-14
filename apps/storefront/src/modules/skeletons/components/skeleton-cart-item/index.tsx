import { Container } from "@medusajs/ui"

const SkeletonCartItem = () => {
  return (
    <Container className="flex gap-4 w-full h-full items-center justify-between animate-pulse">
      <div className="flex gap-x-4 items-start">
        <div className="bg-neutral-200 rounded-lg w-20 h-20" />
        <div className="flex flex-col gap-y-2 justify-between min-h-full self-stretch">
          <div className="flex flex-col gap-y-1">
            <div className="w-10 h-2 bg-neutral-200 rounded-full" />
            <div className="w-32 h-4 bg-neutral-200 rounded-full" />
            <div className="w-24 h-3 bg-neutral-200 rounded-full" />
          </div>
          <div className="flex small:flex-row flex-col gap-2">
            <div className="flex gap-x-2">
              <div className="w-20 h-6 bg-neutral-200 rounded-full" />
              <div className="w-20 h-6 bg-neutral-200 rounded-full" />
              <div className="w-20 h-6 bg-neutral-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between min-h-full self-stretch">
        <div className="w-20 h-4 bg-neutral-200 rounded-full" />
      </div>
    </Container>
  )
}

export default SkeletonCartItem
