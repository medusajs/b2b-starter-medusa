import * as React from "react"

import { DataTableContext, DataTableContextValue } from "./data-table-context"

const useDataTableContext = <TData,>(): DataTableContextValue<TData> => {
  const context = React.useContext(DataTableContext)

  if (!context) {
    throw new Error(
      "useDataTableContext must be used within a DataTableContextProvider"
    )
  }

  return context
}

export { useDataTableContext }
