"use client"

import { MagnifyingGlassMini } from "@medusajs/icons"
import { t } from "@/lib/i18n/copy"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const SearchInResults = ({ listName }: { listName?: string }) => {
  const placeholder = listName ? `${t("plp.search_in_results")} ${listName}` : t("plp.search_in_results")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initial = searchParams.get("q") || ""
  const [value, setValue] = useState(initial)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const buildQueryString = useCallback(
    (val: string) => {
      const params = new URLSearchParams(searchParams?.toString())
      if (val && val.trim().length > 0) {
        params.set("q", val.trim())
        // reset to page 1 on new search
        params.delete("page")
      } else {
        params.delete("q")
        params.delete("page")
      }
      return params.toString()
    },
    [searchParams]
  )

  const commit = useCallback(
    (val: string) => {
      const qs = buildQueryString(val)
      router.replace(qs ? `${pathname}?${qs}` : pathname)
    },
    [buildQueryString, pathname, router]
  )

  // Debounce updates on typing
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setValue(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => commit(next), 350)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (timerRef.current) clearTimeout(timerRef.current)
      commit(value)
    }
  }

  useEffect(() => {
    const currentQ = searchParams.get("q") || ""
    // keep in sync when navigation happens elsewhere
    setValue(currentQ)
  }, [searchParams])

  return (
    <div className="group relative text-sm focus-within:border-neutral-500 rounded-t-lg focus-within:outline focus-within:outline-neutral-500">
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="w-full p-2 pr-8 focus:outline-none rounded-lg"
        aria-label={t("plp.search_in_results")}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <MagnifyingGlassMini className="w-4 h-4 text-neutral-500" />
      </div>
    </div>
  )
}

export default SearchInResults
