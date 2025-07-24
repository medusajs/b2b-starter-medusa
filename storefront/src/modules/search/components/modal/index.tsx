"use client"

import { Input } from "@medusajs/ui"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Hits, SearchBox } from "react-instantsearch"
import {
  createInstantSearchNextInstance,
  InstantSearchNext,
} from "react-instantsearch-nextjs"

import { searchClient } from "../../../../lib/config"
import Modal from "../../../common/components/modal"

type Hit = {
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

  const instantSearchInstance = createInstantSearchNextInstance()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      <div className="hidden small:flex items-center gap-x-6 h-full w-[300px]">
        <Input
          type="search"
          placeholder="Search products..."
          onClick={() => setIsOpen(true)}
          className="w-full"
        />
      </div>
      <Modal isOpen={isOpen} close={() => setIsOpen(false)}>
        <InstantSearchNext
          searchClient={searchClient}
          indexName={process.env.NEXT_PUBLIC_ALGOLIA_PRODUCT_INDEX_NAME}
          instance={instantSearchInstance}
        >
          <div className="flex flex-col gap-6 max-h-[90vh] overflow-hidden">
            <SearchBox
              className="w-full [&_input]:w-[94%] [&_input]:outline-none [&_button]:w-[3%]"
              autoFocus={true}
            />
            <div className="overflow-y-auto">
              <Hits hitComponent={Hit} />
            </div>
          </div>
        </InstantSearchNext>
      </Modal>
    </>
  )
}

const Hit = ({ hit }: { hit: Hit }) => {
  return (
    <div className="flex flex-row gap-x-2 mt-4 relative gap-4">
      {hit.thumbnail ? (
        <Image
          src={hit.thumbnail}
          alt={hit.title}
          width={96}
          height={96}
          className="object-contain"
        />
      ) : (
        <div className="w-24 h-24 bg-gray-300 rounded-xl"></div>
      )}

      <div className="flex flex-col gap-y-1">
        <h3>{hit.title}</h3>
        <p className="text-sm text-gray-500">{hit.description}</p>
      </div>
      <Link
        href={`/products/${hit.handle}`}
        className="absolute right-0 top-0 w-full h-full"
        aria-label={`View Product: ${hit.title}`}
      />
    </div>
  )
}
