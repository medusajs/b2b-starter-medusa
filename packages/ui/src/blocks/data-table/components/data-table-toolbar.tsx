import { DataTableFilterBar } from "@/blocks/data-table/components/data-table-filter-bar"
import { useDataTableContext } from "@/blocks/data-table/context/use-data-table-context"
import { clx } from "@/utils/clx"
import * as React from "react"

interface DataTableToolbarTranslations {
  /**
   * The label for the clear all filters button
   * @default "Clear all"
   */
  clearAll?: string
  /**
   * The tooltip for the sorting menu
   */
  sort?: string
  /**
   * The tooltip for the columns menu  
   */
  columns?: string
}

interface DataTableToolbarProps {
  /**
   * Additional classes to pass to the wrapper `div` of the component.
   */
  className?: string
  /**
   * The children to show in the toolbar.
   */
  children?: React.ReactNode
  /**
   * The translations of strings in the toolbar.
   */
  translations?: DataTableToolbarTranslations
  /**
   * Custom content to render in the filter bar
   */
  filterBarContent?: React.ReactNode
}

/**
 * Toolbar shown for the data table.
 */
const DataTableToolbar = (props: DataTableToolbarProps) => {
  const { instance } = useDataTableContext()
  const hasFilters = instance.getFilters().length > 0

  return (
    <div className="flex flex-col divide-y">
      <div className={clx("flex items-center px-6 py-4", props.className)}>
        {props.children}
      </div>
      <DataTableFilterBar
        clearAllFiltersLabel={props.translations?.clearAll}
        alwaysShow={hasFilters}
        sortingTooltip={props.translations?.sort}
        columnsTooltip={props.translations?.columns}
      >
        {props.filterBarContent}
      </DataTableFilterBar>
    </div>
  )
}

export { DataTableToolbar }
export type { DataTableToolbarProps, DataTableToolbarTranslations }

