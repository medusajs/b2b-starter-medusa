"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

// Simple SVG icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface SearchHit {
  id: string
  title: string
  description?: string
  handle: string
  thumbnail?: string
  price?: number
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchHit[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      console.log("Searching for:", searchQuery)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      // Add publishable API key if available
      if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
        headers["x-publishable-api-key"] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      }
      
      const response = await fetch(`http://localhost:9000/store/products/search`, {
        method: "POST",
        headers,
        body: JSON.stringify({ q: searchQuery }),
      })

      console.log("Response status:", response.status)
      if (response.ok) {
        const data = await response.json()
        console.log("Search results:", data)
        setResults(data.hits || [])
      } else {
        console.error("Search failed:", response.status, response.statusText)
        const errorText = await response.text()
        console.error("Error details:", errorText)
        setResults([])
      }
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchProducts(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, searchProducts])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleProductClick = (handle: string) => {
    router.push(`/products/${handle}`)
    onClose()
    setQuery("")
    setResults([])
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-start justify-center pt-20">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
          <div className="flex items-center gap-3 p-4 border-b">
            <div className="text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 outline-none text-base"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XIcon />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="p-8 text-center text-gray-500">
                Searching...
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No products found for "{query}"
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="py-2">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.handle)}
                    className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-4 transition-colors text-left"
                  >
                    {product.thumbnail && (
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {product.title}
                      </div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate">
                          {product.description}
                        </div>
                      )}
                    </div>
                    {product.price && (
                      <div className="text-sm font-medium text-gray-900">
                        ${Number(product.price).toFixed(2)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {!loading && !query && (
              <div className="p-8 text-center text-gray-400">
                Start typing to search products
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}