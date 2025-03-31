"use client"

import Button from "@/modules/common/components/button"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

export default function ResourcePagination({
  totalPages,
  currentPage,
  pageParam,
}: {
  totalPages: number
  currentPage: number
  pageParam: string
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [pendingPage, setPendingPage] = useState<number | null>(null)

  const handlePageChange = (page: number) => {
    setPendingPage(page)
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      params.set(pageParam, String(page))
      router.push(`${window.location.pathname}?${params}`, { scroll: false })
    })
  }

  const generatePagination = (): (number | string)[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 3) {
      return [
        ...Array.from({ length: 4 }, (_, i) => i + 1),
        "ellipsis",
        totalPages,
      ]
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "ellipsis",
        ...Array.from({ length: 4 }, (_, i) => totalPages - 3 + i),
      ]
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ]
  }

  return (
    <div className="flex gap-x-2 justify-center">
      {generatePagination().map((page, i) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="flex px-2 items-center">
            . . .
          </span>
        ) : (
          <Button
            key={page}
            onClick={() => handlePageChange(page as number)}
            isLoading={pending && page === pendingPage}
            className="px-1 py-1 rounded-full min-w-8 text-center"
            variant={currentPage === page ? "primary" : "secondary"}
          >
            {page}
          </Button>
        )
      )}
    </div>
  )
}
