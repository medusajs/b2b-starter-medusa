import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading - Estado de carregamento com skeleton acessível
 * UX Strategy: feedback visual imediato, previne CLS (Cumulative Layout Shift)
 * Acessibilidade: aria-label + aria-busy para screen readers
 */
export default function Loading() {
  return (
    <div
      className="content-container py-6"
      role="status"
      aria-busy="true"
      aria-label="Carregando conteúdo..."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3" aria-hidden="true">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        ))}
      </div>
      {/* Screen reader announcement */}
      <span className="sr-only">Carregando produtos do catálogo...</span>
    </div>
  )
}
