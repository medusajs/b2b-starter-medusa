"use client"

import { Input } from "@/components/input"
import { Skeleton } from "@/components/skeleton"
import { clx } from "@/utils/clx"
import * as React from "react"

import { useDataTableContext } from "@/blocks/data-table/context/use-data-table-context"

interface DataTableSearchProps {
  /**
   * If true, the search input will be focused on mount.
   */
  autoFocus?: boolean
  /**
   * Additional classes to pass to the search input.
   */
  className?: string
  /**
   * The placeholder text to show in the search input.
   */
  placeholder?: string
}

/**
 * This component adds a search input to the data table, allowing users
 * to search through the table's data.
 */
const DataTableSearch = (props: DataTableSearchProps) => {
  const { className, ...rest } = props
  const { instance } = useDataTableContext()

  if (!instance.enableSearch) {
    throw new Error(
      "DataTable.Search was rendered but search is not enabled. Make sure to pass search to 'useDataTable'"
    )
  }

  if (instance.showSkeleton) {
    return <DataTableSearchSkeleton />
  }

  return (
    <Input
      size="small"
      type="search"
      value={instance.getSearch()}
      onChange={(e) => instance.onSearchChange(e.target.value)}
      className={clx(
        {
          "pr-[calc(15px+2px+8px)]": instance.isLoading,
        },
        className
      )}
      {...rest}
    />
  )
}
DataTableSearch.displayName = "DataTable.Search"

const DataTableSearchSkeleton = () => {
  return <Skeleton className="h-7 w-[128px]" />
}

export { DataTableSearch }
export type { DataTableSearchProps }

