import { ProductDetailSkeleton } from '@/components/common/LoadingSkeleton'

export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetailSkeleton />
    </div>
  )
}
