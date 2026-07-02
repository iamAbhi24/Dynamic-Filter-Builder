import { useState } from 'react'
import { Box, Button, Chip, FormControl, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material'

export type FilterRow = {
  id: number
  field: string
  operator: string
  value: string
}

type FieldType = 'text' | 'number' | 'date' | 'select'

const fieldOptions = [
  { value: 'name', label: 'Name', type: 'text' as FieldType },
  { value: 'department', label: 'Department', type: 'select' as FieldType },
  { value: 'status', label: 'Status', type: 'select' as FieldType },
  { value: 'salary', label: 'Salary', type: 'number' as FieldType },
  { value: 'joinDate', label: 'Join Date', type: 'date' as FieldType },
]

const operatorOptions = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'greaterThan', label: 'Greater than' },
]

const selectOptions = {
  department: ['Engineering', 'Operations', 'Finance', 'HR', 'Marketing', 'Sales', 'Legal', 'Design'],
  status: ['Active', 'Inactive', 'On Leave', 'Probation'],
}

type FilterValueInputProps = {
  field: string
  value: string
  onChange: (value: string) => void
}

function FilterValueInput({ field, value, onChange }: FilterValueInputProps) {
  const fieldConfig = fieldOptions.find((option) => option.value === field)
  const type = fieldConfig?.type ?? 'text'

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

export function FilterBuilder() {
  const [filters, setFilters] = useState<FilterRow[]>([
    { id: 1, field: 'name', operator: 'contains', value: '' },
  ])

  const addFilter = () => {
    const nextId = Date.now()
    setFilters((current) => [...current, { id: nextId, field: 'department', operator: 'contains', value: '' }])
  }

  const removeFilter = (id: number) => {
    setFilters((current) => current.filter((filter) => filter.id !== id))
  }

  const updateFilter = (id: number, key: keyof FilterRow, value: string) => {
    setFilters((current) =>
      current.map((filter) => (filter.id === id ? { ...filter, [key]: value } : filter)),
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
                {operatorOptions.map((option) => (
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
