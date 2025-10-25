/**
 * Table Component - RE-EXPORT
 * This file now re-exports from the unified design system
 *
 * DEPRECATED: Import directly from '@/lib/design-system/components/Table'
 * This file maintained for backward compatibility during migration
 */

import {
    Table as DesignSystemTable,
    TableHeader as DesignSystemTableHeader,
    TableBody as DesignSystemTableBody,
    TableRow as DesignSystemTableRow,
    TableCell as DesignSystemTableCell,
    TableHeaderCell as DesignSystemTableHeaderCell,
    TablePagination as DesignSystemTablePagination,
} from '@/lib/design-system/components/Table'

// Re-export with named exports for backward compatibility
export const Table = DesignSystemTable
export const TableHeader = DesignSystemTableHeader
export const TableBody = DesignSystemTableBody
export const TableRow = DesignSystemTableRow
export const TableCell = DesignSystemTableCell
export const TableHeaderCell = DesignSystemTableHeaderCell
export const TablePagination = DesignSystemTablePagination