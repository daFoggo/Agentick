import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { DragDropManager } from "@dnd-kit/dom"
import { isSortable, SortableDraggable } from "@dnd-kit/dom/sortable"
import {
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnOrderState,
  type ColumnPinningState,
  type ExpandedState,
  type GroupingState,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { memo, useEffect, useMemo, useState } from "react"
import "./data-table"
import { DataTableGroupRow } from "./data-table-group-row"
import { DataTableHeaderCell } from "./data-table-header-cell"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableRow } from "./data-table-row"

export interface IDataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  getSubRows?: (row: TData) => TData[] | undefined
  renderGroupRow?: (
    row: import("@tanstack/react-table").Row<TData>,
    totalCols: number,
    table: import("@tanstack/react-table").Table<TData>
  ) => React.ReactNode
  defaultGrouping?: GroupingState
  defaultColumnPinning?: ColumnPinningState
  defaultPageSize?: number
  pageSizeOptions?: number[]
  showPagination?: boolean
  showRowCount?: boolean
  showRowsPerPage?: boolean
  showSelectedCount?: boolean
  enablePagination?: boolean
  enableRowSelection?: boolean
  enableColumnReorder?: boolean
  enableColumnPinning?: boolean
  className?: string
  wrapperClassName?: string
  getRowId?: (row: TData) => string
}

const DataTableInner = <TData,>({
  data,
  columns,
  getSubRows,
  renderGroupRow,
  defaultGrouping = [],
  defaultColumnPinning = {},
  defaultPageSize = 20,
  pageSizeOptions,
  showPagination = true,
  enablePagination = true,
  showRowCount = true,
  showRowsPerPage = true,
  showSelectedCount = true,
  enableRowSelection = false,
  className,
  wrapperClassName,
  getRowId,
  enableColumnReorder = true,
  enableColumnPinning = true,
}: IDataTableProps<TData>) => {
  // ── State ────────────────────────────────────────────────────────────────
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnPinning, setColumnPinning] =
    useState<ColumnPinningState>(defaultColumnPinning)
  const [grouping, setGrouping] = useState<GroupingState>(defaultGrouping)
  const [expanded, setExpanded] = useState<ExpandedState>({})

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
    columns.map((c) => (c as { id?: string }).id ?? "")
  )

  // ── DragDropManager (Vanilla) ───────────────────────────────────────────
  const manager = useMemo(() => new DragDropManager(), [])

  // ── Columns Mapping ───────────────────────────────────────────────────────
  const finalColumns = useMemo(() => {
    const hasCustomSelect = columns.some(
      (c) => (c.meta as any)?.isSelectColumn || c.id === "select"
    )

    if (!enableRowSelection || hasCustomSelect) return columns

    return [
      {
        id: "select",
        size: 40,
        meta: {
          enablePinning: false,
          enableReorder: false,
          isSelectColumn: true,
        },
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            onClick={(e) => e.stopPropagation()}
            aria-label="Select row"
          />
        ),
      } as ColumnDef<TData, any>,
      ...columns,
    ]
  }, [columns, enableRowSelection])

  // ── Table instance ────────────────────────────────────────────────────────
  const table = useReactTable({
    data,
    columns: finalColumns,
    getRowId,
    getSubRows,

    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,

    state: {
      rowSelection,
      columnPinning,
      grouping,
      expanded,
      pagination: enablePagination ? pagination : undefined,
      columnOrder,
    },

    onRowSelectionChange: setRowSelection,
    onColumnPinningChange: setColumnPinning,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,

    // When grouping or paginating, we don't want to reset expansion state
    autoResetExpanded: false,

    groupedColumnMode: false,
    enableRowSelection,
    enableMultiRowSelection: true,
    enableSubRowSelection: true,
  })

  // Auto-expand the FIRST group on initial load
  useEffect(() => {
    if (
      grouping.length > 0 &&
      (expanded === true || Object.keys(expanded).length === 0)
    ) {
      const rows = table.getRowModel().flatRows
      const firstGroup = rows.find((r) => r.getIsGrouped())
      if (firstGroup) {
        setExpanded({ [firstGroup.id]: true })
      }
    }
    // Only run when data or grouping changes initially
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length, grouping.length, table])

  // ── Handle reorder via DragDropManager ──────────────────────────────────
  const unpinnedLeafColumns = table.getCenterLeafColumns()
  const unpinnedIds = unpinnedLeafColumns.map((c) => c.id)

  useEffect(() => {
    const onDragEnd = (event: any) => {
      const { operation, canceled } = event
      if (canceled) return

      const { source } = operation
      if (isSortable(source)) {
        // Cast to SortableDraggable as Draggable + isSortable = SortableDraggable
        const sortableSource = source as SortableDraggable<any>
        const initialIndex = sortableSource.initialIndex
        const index = sortableSource.index

        if (initialIndex === index) return

        // Reorder within unpinned segment
        const newUnpinned = [...unpinnedIds]
        const [moved] = newUnpinned.splice(initialIndex, 1)
        newUnpinned.splice(index, 0, moved)

        const leftIds = table.getLeftLeafColumns().map((c) => c.id)
        const rightIds = table.getRightLeafColumns().map((c) => c.id)
        setColumnOrder([...leftIds, ...newUnpinned, ...rightIds])
      }
    }

    manager.monitor.addEventListener("dragend", onDragEnd)
    return () => manager.monitor.removeEventListener("dragend", onDragEnd)
  }, [manager, unpinnedIds, table])

  // ── Render ────────────────────────────────────────────────────────────────
  const allHeaderGroups = table.getHeaderGroups()
  const rows = table.getRowModel().rows
  const totalCols = table.getAllLeafColumns().length

  return (
    <div
      className={cn(
        "flex flex-col gap-0 overflow-hidden rounded-md border",
        wrapperClassName
      )}
    >
      <div className="relative overflow-auto">
        <Table className={cn("min-w-full", className)}>
          <TableHeader>
            {allHeaderGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const unpinnedIndex = unpinnedIds.indexOf(header.column.id)
                  return (
                    <DataTableHeaderCell
                      key={header.id}
                      header={header}
                      index={unpinnedIndex === -1 ? 0 : unpinnedIndex}
                      table={table}
                      manager={manager}
                      enableColumnReorder={enableColumnReorder}
                      enableColumnPinning={enableColumnPinning}
                    />
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={totalCols}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                if (row.getIsGrouped()) {
                  if (renderGroupRow) {
                    return renderGroupRow(row, totalCols, table)
                  }
                  return (
                    <DataTableGroupRow
                      key={row.id}
                      row={row}
                      totalCols={totalCols}
                    />
                  )
                }
                return <DataTableRow key={row.id} row={row} />
              })
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="border-t">
          <DataTablePagination
            table={table}
            pageSizeOptions={pageSizeOptions}
            showRowCount={showRowCount}
            showRowsPerPage={showRowsPerPage}
            showSelectedCount={showSelectedCount}
            enablePagination={enablePagination}
          />
        </div>
      )}
    </div>
  )
}

export const DataTable = memo(DataTableInner) as typeof DataTableInner
