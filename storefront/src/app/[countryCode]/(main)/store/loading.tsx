import { ProductGridSkeleton } from '@/components/common/LoadingSkeleton'

export default function StoreLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <ProductGridSkeleton count={12} />
    </div>
  )
}
