"use client"

import type {
  DataTableCellContext,
  DataTableHeaderContext,
} from "@/blocks/data-table/types"
import { Checkbox, CheckboxCheckedState } from "@/components/checkbox"
import * as React from "react"

interface DataTableSelectCellProps<TData> {
  ctx: DataTableCellContext<TData, unknown>
}

const DataTableSelectCell = <TData,>(
  props: DataTableSelectCellProps<TData>
) => {
  const checked = props.ctx.row.getIsSelected()
  const onChange = props.ctx.row.getToggleSelectedHandler()
  const disabled = !props.ctx.row.getCanSelect()

  return (
    <Checkbox
      onClick={(e) => e.stopPropagation()}
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  )
}
DataTableSelectCell.displayName = "DataTable.SelectCell"

interface DataTableSelectHeaderProps<TData> {
  ctx: DataTableHeaderContext<TData, unknown>
}

const DataTableSelectHeader = <TData,>(
  props: DataTableSelectHeaderProps<TData>
) => {
  const checked = props.ctx.table.getIsSomePageRowsSelected()
    ? "indeterminate"
    : props.ctx.table.getIsAllPageRowsSelected()

  const onChange = (checked: CheckboxCheckedState) => {
    props.ctx.table.toggleAllPageRowsSelected(!!checked)
  }
  const disabled = !props.ctx.table
    .getRowModel()
    .rows.some((row) => row.getCanSelect())

  return (
    <Checkbox
      onClick={(e) => e.stopPropagation()}
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  )
}

export { DataTableSelectCell, DataTableSelectHeader }
export type { DataTableSelectCellProps, DataTableSelectHeaderProps }
