import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Table } from "@/components/table"

interface DataTableNonSortableHeaderCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  id: string
  children: React.ReactNode
  isFirstColumn?: boolean
}

export const DataTableNonSortableHeaderCell = React.forwardRef<
  HTMLTableCellElement,
  DataTableNonSortableHeaderCellProps
>(({ id, children, className, style: propStyle, isFirstColumn, ...props }, ref) => {
  // Still use sortable hook but without listeners
  const {
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    disabled: true, // Disable dragging
  })

  // Only apply horizontal transform for smooth shifting
  const transformStyle = transform ? {
    x: transform.x,
    y: 0,
    scaleX: transform.scaleX,
    scaleY: transform.scaleY,
  } : null

  const style: React.CSSProperties = {
    ...propStyle,
    transform: transformStyle ? CSS.Transform.toString(transformStyle) : undefined,
    transition,
  }

  const combineRefs = (element: HTMLTableCellElement | null) => {
    setNodeRef(element)
    if (ref) {
      if (typeof ref === 'function') {
        ref(element)
      } else {
        ref.current = element
      }
    }
  }

  return (
    <Table.HeaderCell
      ref={combineRefs}
      style={style}
      className={className}
      {...props}
    >
      {children}
    </Table.HeaderCell>
  )
})

DataTableNonSortableHeaderCell.displayName = "DataTableNonSortableHeaderCell"