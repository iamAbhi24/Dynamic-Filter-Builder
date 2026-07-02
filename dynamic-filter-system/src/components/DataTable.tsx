import { useMemo, useState } from 'react'
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'

export type ColumnDefinition<T> = {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
  sortValue?: (row: T) => string | number | boolean | Date | null | undefined
}

type DataTableProps<T extends Record<string, unknown>> = {
  rows: T[]
  columns: ColumnDefinition<T>[]
  emptyMessage?: string
}

type SortDirection = 'asc' | 'desc'

type SortConfig = {
  key: string
  direction: SortDirection
}

function SortIcon({ active, direction }: { active: boolean; direction?: SortDirection }) {
  if (!active) {
    return <ChevronsUpDown size={14} />
  }

  return direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
}

function getComparableValue<T extends Record<string, unknown>>(row: T, column: ColumnDefinition<T>) {
  if (column.sortValue) {
    return column.sortValue(row)
  }

  const value = row[column.key]

  if (value === null || value === undefined) {
    return ''
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  if (typeof value === 'object') {
    // Objects need a stable primitive value before JavaScript can compare them.
    return JSON.stringify(value)
  }

  return value
}

export function DataTable<T extends Record<string, unknown>>({
  rows,
  columns,
  emptyMessage = 'No records available.',
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const sortedRows = useMemo(() => {
    if (!sortConfig) {
      return rows
    }

    const column = columns.find((entry) => String(entry.key) === sortConfig.key)

    if (!column) {
      return rows
    }

    return [...rows].sort((left, right) => {
      const leftValue = getComparableValue(left, column)
      const rightValue = getComparableValue(right, column)

      // Keep null and undefined sortable without special cases in every column.
      const normalizedLeft = leftValue ?? ''
      const normalizedRight = rightValue ?? ''

      if (normalizedLeft === normalizedRight) {
        return 0
      }

      const isDescending = sortConfig.direction === 'desc'
      const comparison = normalizedLeft > normalizedRight ? 1 : -1

      return isDescending ? comparison * -1 : comparison
    })
  }, [columns, rows, sortConfig])

  const handleSort = (column: ColumnDefinition<T>) => {
    if (!column.sortable) {
      return
    }

    setSortConfig((current) => {
      if (current?.key === String(column.key)) {
        return {
          key: String(column.key),
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        }
      }

      return {
        key: String(column.key),
        direction: 'asc',
      }
    })
  }

  if (!rows.length) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={String(column.key)}
                onClick={() => handleSort(column)}
                sx={{ cursor: column.sortable ? 'pointer' : 'default', userSelect: 'none' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{column.label}</span>
                  {column.sortable && (
                    <SortIcon active={sortConfig?.key === String(column.key)} direction={sortConfig?.direction} />
                  )}
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((row, rowIndex) => (
            <TableRow key={rowIndex} hover>
              {columns.map((column) => {
                const value = row[column.key]

                return (
                  <TableCell key={String(column.key)}>
                    {column.render ? column.render(value, row) : String(value ?? '')}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
