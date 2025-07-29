"use client"

import { MagnifyingGlass } from "@medusajs/icons"
import { Button } from "@medusajs/ui"
import { Hit } from "algoliasearch"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  Hits,
  PoweredBy,
  SearchBox,
  useInstantSearch,
} from "react-instantsearch"
import {
  createInstantSearchNextInstance,
  InstantSearchNext,
} from "react-instantsearch-nextjs"
import { searchClient } from "../../../../lib/config"
import Modal from "../../../common/components/modal"

type ProductHit = Hit & {
  objectID: string
  id: string
  title: string
  description: string
  handle: string
  thumbnail: string
}

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const searchFormRef = useRef<HTMLFormElement>(null)

  const instantSearchInstance = createInstantSearchNextInstance()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchFormRef.current?.querySelector("input")?.focus()
      }, 150)

      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const openSearch = () => {
    setIsOpen(true)
  }

  return (
    <>
      {/* Search Button */}
      <Button
        variant="secondary"
        onClick={openSearch}
        className="hidden small:flex items-center gap-2 px-4 w-56 py-2 text-sm text-ui-fg-muted bg-ui-bg-component border border-ui-border-base shadow-none rounded-lg hover:bg-gray-100 transition-colors font-normal"
      >
        <MagnifyingGlass />
        Search...
        <kbd className="ml-auto text-xs bg-ui-bg-base px-2 py-1 rounded border">
          ⌘K
        </kbd>
      </Button>

      {/* Mobile Search Button */}
      <Button
        variant="secondary"
        onClick={openSearch}
        className="small:hidden p-2"
        aria-label="Search products"
      >
        <MagnifyingGlass />
      </Button>

      <Modal isOpen={isOpen} close={() => setIsOpen(false)}>
        <InstantSearchNext
          searchClient={searchClient}
          indexName={
            process.env.NEXT_PUBLIC_ALGOLIA_PRODUCT_INDEX_NAME || "products"
          }
          instance={instantSearchInstance}
        >
          <div className="flex flex-col gap-4 max-h-full overflow-y-hidden">
            <div className="relative">
              <SearchBox
                formRef={searchFormRef}
                placeholder="Search for products..."
                className="w-full"
                classNames={{
                  root: "relative",
                  form: "relative",
                  input:
                    "w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg focus:outline focus:outline-[1px] focus:-outline-offset-2 focus:outline-ui-fg-interactive",
                  submit:
                    "absolute right-3 top-1/2 transform -translate-y-1/2 p-1",
                  submitIcon: "w-4 h-4 fill-gray-500",
                  reset:
                    "absolute right-10 top-1/2 transform -translate-y-1/2 p-1",
                  resetIcon: "w-4 h-4 fill-gray-500",
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <SearchResults onProductClick={() => setIsOpen(false)} />
            </div>
          </div>

          <PoweredBy
            theme="light"
            classNames={{
              root: "h-3 mt-2",
              logo: "h-full ml-auto",
            }}
          />
        </InstantSearchNext>
      </Modal>

      <KeyboardShortcut onSearch={openSearch} />
    </>
  )
}

function SearchResults({ onProductClick }: { onProductClick: () => void }) {
  const { indexUiState, results } = useInstantSearch()
  const hasQuery = indexUiState.query && indexUiState.query.length > 0
  const hasResults = results && results.nbHits > 0

  if (!hasQuery) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Start typing to search for products...</p>
      </div>
    )
  }

  if (hasQuery && !hasResults) {
    return (
      <div className="text-center py-12 text-gray-500">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-sm">
          {`We couldn't find any products matching "${indexUiState.query}".`}
        </p>
        <p className="text-sm mt-1">
          Try adjusting your search or browse our product categories.
        </p>
      </div>
    )
  }

  return (
    <div>
      <Hits
        hitComponent={(props) => (
          <ProductHitComponent
            hit={props.hit as ProductHit}
            onProductClick={onProductClick}
          />
        )}
      />
    </div>
  )
}

const ProductHitComponent = ({
  hit,
  onProductClick,
}: {
  hit: ProductHit
  onProductClick: () => void
}) => {
  const handleClick = () => {
    onProductClick()
  }

  return (
    <Link
      href={`/products/${hit.handle}`}
      onClick={handleClick}
      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-b-0"
    >
      {hit.thumbnail ? (
        <Image
          src={hit.thumbnail}
          alt={hit.title}
          width={60}
          height={60}
          className="object-contain rounded-md bg-gray-50 flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{hit.title}</h3>
        {hit.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {hit.description}
          </p>
        )}
      </div>
    </Link>
  )
}

function KeyboardShortcut({ onSearch }: { onSearch: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        onSearch()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onSearch])

  return null
}
