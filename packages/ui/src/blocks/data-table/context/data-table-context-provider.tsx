"use client"

import * as React from "react"

import { UseDataTableReturn } from "../use-data-table"
import { DataTableContext } from "./data-table-context"

type DataTableContextProviderProps<TData> = {
  instance: UseDataTableReturn<TData>
  children: React.ReactNode
}

const DataTableContextProvider = <TData,>({
  instance,
  children,
}: DataTableContextProviderProps<TData>) => {
  return (
    <DataTableContext.Provider 
      value={{ 
        instance,
        enableColumnVisibility: instance.enableColumnVisibility,
        enableColumnOrder: instance.enableColumnOrder
      }}
    >
      {children}
    </DataTableContext.Provider>
  )
}

export { DataTableContextProvider }
