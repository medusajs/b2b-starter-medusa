"use client"

import { useState } from "react"
import { SearchModal } from "../search-modal"

export function SearchButton() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <div className="relative mr-2 hidden small:inline-flex">
        <input
          type="text"
          placeholder="Search for products"
          className="bg-gray-100 text-zinc-900 px-4 py-2 rounded-full pr-10 shadow-borders-base hidden small:inline-block cursor-pointer"
          onClick={() => setIsSearchOpen(true)}
          readOnly
        />
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}