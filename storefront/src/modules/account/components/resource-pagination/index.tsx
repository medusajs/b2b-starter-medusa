"use client"

import { useRouter, useSearchParams } from "next/navigation"

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

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set(pageParam, String(page))
    router.push(`${window.location.pathname}?${params}`, { scroll: false })
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
          <button
            key={page}
            onClick={() => handlePageChange(page as number)}
            className={`px-2 py-1 rounded-full min-w-8 text-center ${
              currentPage === page
                ? "bg-gray-900 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        )
      )}
    </div>
  )
}
