"use client"

import { listProducts } from "@/lib/data/products"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { StoreProduct } from "@medusajs/types"
import { Input } from "@medusajs/ui"
import { debounce } from "lodash"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

interface SearchResult {
  id: string
  title: string
  imageUrl: string
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<StoreProduct[]>([])
  const [showResults, setShowResults] = useState(false)

  const params = useParams()
  const countryCode = params.countryCode?.toString() || "us"

  const performSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const {
          response: { products },
        } = await listProducts({
          queryParams: {
            q: term,
          },
          countryCode,
        })
        setResults(products)
      } catch (error) {
        console.error(error)
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [countryCode]
  )

  useEffect(() => {
    const debouncedSearch = debounce((term: string) => {
      performSearch(term)
    }, 400)

    if (searchTerm) {
      debouncedSearch(searchTerm)
    } else {
      setResults([])
    }

    return () => {
      debouncedSearch.cancel()
    }
  }, [performSearch, searchTerm])

  return (
    <div className="sm:relative w-full">
      <Input
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setShowResults(true)
        }}
        onFocus={() => {
          setShowResults(true)
        }}
        onBlur={debounce((e) => {
          debugger
          setShowResults(false)
        }, 100)}
        placeholder="Search for products"
        autoComplete="off"
        type="search"
        className="w-full"
      />

      {showResults && (searchTerm || loading) && (
        <div className="absolute top-full left-0 right-0 sm:left-1/2 small:right-auto small:-translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-[80vh] overflow-y-auto z-50 w-full small:w-96">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {results.map((result) => (
                <LocalizedClientLink
                  key={result.id}
                  href={`/products/${result.handle}`}
                  onClick={() => {
                    setSearchTerm("")
                  }}
                >
                  <div
                    key={result.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    {result.thumbnail && (
                      <div className="relative w-12 h-12">
                        <Image
                          src={result.thumbnail}
                          alt={result.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <span className="flex-1 text-sm">{result.title}</span>
                  </div>
                </LocalizedClientLink>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default Search
