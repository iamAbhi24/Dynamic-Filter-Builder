import { useEffect, useState } from 'react'
import { Box, Button, Chip, FormControl, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material'
import type { FilterCondition, FilterOperator } from '../utils/filterEngine'

export type FilterRow = {
  id: number
  field: string
  operator: FilterOperator
  value: string
}

type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean'

const fieldOptions = [
  { value: 'name', label: 'Name', type: 'text' as FieldType },
  { value: 'department', label: 'Department', type: 'select' as FieldType },
  { value: 'status', label: 'Status', type: 'select' as FieldType },
  { value: 'salary', label: 'Salary', type: 'number' as FieldType },
  { value: 'joinDate', label: 'Join Date', type: 'date' as FieldType },
  { value: 'isActive', label: 'Active', type: 'boolean' as FieldType },
  { value: 'address.city', label: 'City', type: 'text' as FieldType },
  { value: 'skills', label: 'Skills', type: 'text' as FieldType },
]

const operatorOptionsByType: Record<FieldType, Array<{ value: FilterOperator; label: string }>> = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
  ],
  select: [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not equal' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'greaterThan', label: 'Greater than' },
    { value: 'lessThan', label: 'Less than' },
  ],
  date: [
    { value: 'equals', label: 'Equals' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
  ],
  boolean: [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not equal' },
  ],
}

const selectOptions = {
  department: ['Engineering', 'Operations', 'Finance', 'HR', 'Marketing', 'Sales', 'Legal', 'Design'],
  status: ['Active', 'Inactive', 'On Leave', 'Probation'],
}

type FilterValueInputProps = {
  field: string
  value: string
  onChange: (value: string) => void
}

function getFieldType(field: string): FieldType {
  return fieldOptions.find((option) => option.value === field)?.type ?? 'text'
}

function getOperatorOptions(field: string) {
  return operatorOptionsByType[getFieldType(field)] ?? operatorOptionsByType.text
}

function FilterValueInput({ field, value, onChange }: FilterValueInputProps) {
  const type = getFieldType(field)

  if (type === 'boolean') {
    return (
      <FormControl size="small">
        <Select value={value} onChange={(event) => onChange(event.target.value)}>
          <MenuItem value="true">True</MenuItem>
          <MenuItem value="false">False</MenuItem>
        </Select>
      </FormControl>
    )
  }

  if (type === 'select') {
    return (
      <FormControl size="small">
        <Select value={value} onChange={(event) => onChange(event.target.value)}>
          {(selectOptions[field as keyof typeof selectOptions] ?? []).map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }

  if (type === 'number') {
    return (
      <TextField
        size="small"
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter number"
      />
    )
  }

  if (type === 'date') {
    return (
      <TextField
        size="small"
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    )
  }

  return (
    <TextField
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Enter value"
    />
  )
}

type FilterBuilderProps = {
  onChange?: (filters: FilterCondition[]) => void
}

export function FilterBuilder({ onChange }: FilterBuilderProps) {
  const [filters, setFilters] = useState<FilterRow[]>([
    { id: 1, field: 'name', operator: 'contains', value: '' },
  ])

  const addFilter = () => {
    const nextId = Date.now()
    setFilters((current) => [...current, { id: nextId, field: 'department', operator: 'equals', value: '' }])
  }

  const removeFilter = (id: number) => {
    setFilters((current) => current.filter((filter) => filter.id !== id))
  }

  useEffect(() => {
    onChange?.(
      filters
        .filter((filter) => filter.value !== '' && filter.value !== null)
        .map((filter) => ({
          id: filter.id,
          field: filter.field,
          operator: filter.operator,
          value: filter.value,
        })),
    )
  }, [filters, onChange])

  const updateFilter = (id: number, key: keyof FilterRow, value: string) => {
    setFilters((current) =>
      current.map((filter) => {
        if (filter.id !== id) {
          return filter
        }

        if (key === 'field') {
          const nextOperators = getOperatorOptions(value)
          const currentOperatorIsValid = nextOperators.some((option: { value: FilterOperator; label: string }) => option.value === filter.operator)

          return {
            ...filter,
            field: value,
            operator: currentOperatorIsValid ? filter.operator : nextOperators[0].value,
          }
        }

        return { ...filter, [key]: value }
      }),
    )
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filter Builder</Typography>
        <Button variant="contained" onClick={addFilter}>
          Add Filter
        </Button>
      </Box>

      <Stack spacing={2}>
        {filters.map((filter) => (
          <Box key={filter.id} sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1.2fr 1fr 1.4fr auto' }}>
            <FormControl size="small">
              <Select
                value={filter.field}
                onChange={(event) => updateFilter(filter.id, 'field', event.target.value)}
              >
                {fieldOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <Select
                value={filter.operator}
                onChange={(event) => updateFilter(filter.id, 'operator', event.target.value)}
              >
                {getOperatorOptions(filter.field).map((option: { value: FilterOperator; label: string }) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FilterValueInput
              field={filter.field}
              value={filter.value}
              onChange={(value) => updateFilter(filter.id, 'value', value)}
            />

            <Button color="inherit" onClick={() => removeFilter(filter.id)}>
              Remove
            </Button>
          </Box>
        ))}
      </Stack>

      {filters.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Chip label={`${filters.length} active filter${filters.length > 1 ? 's' : ''}`} />
        </Box>
      )}
    </Paper>
  )
}
