import { Table as MedusaTable } from "@medusajs/ui"

/**
 * Yello Solar Hub Table Component
 * Wrapper around Medusa UI Table component
 *
 * @example
 * <Table>
 *   <Table.Header>
 *     <Table.Row>
 *       <Table.HeaderCell>Nome</Table.HeaderCell>
 *       <Table.HeaderCell>Email</Table.HeaderCell>
 *     </Table.Row>
 *   </Table.Header>
 *   <Table.Body>
 *     <Table.Row>
 *       <Table.Cell>João Silva</Table.Cell>
 *       <Table.Cell>joao@email.com</Table.Cell>
 *     </Table.Row>
 *   </Table.Body>
 * </Table>
 */

const Table = MedusaTable
const TableHeader = MedusaTable.Header
const TableBody = MedusaTable.Body
const TableRow = MedusaTable.Row
const TableCell = MedusaTable.Cell
const TableHeaderCell = MedusaTable.HeaderCell
const TablePagination = MedusaTable.Pagination

export {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHeaderCell,
    TablePagination,
}