import { useEffect, useState } from 'react'
import { Box, Button, Chip, FormControl, FormHelperText, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material'
import type { FilterCondition, FilterOperator } from '../utils/filterEngine'

export type FilterRow = {
  id: number
  field: string
  operator: FilterOperator
  value: string
  value2?: string
}

type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean' | 'array'

const fieldOptions = [
  { value: 'name', label: 'Name', type: 'text' as FieldType },
  { value: 'department', label: 'Department', type: 'select' as FieldType },
  { value: 'status', label: 'Status', type: 'select' as FieldType },
  { value: 'salary', label: 'Salary', type: 'number' as FieldType },
  { value: 'joinDate', label: 'Join Date', type: 'date' as FieldType },
  { value: 'isActive', label: 'Active', type: 'boolean' as FieldType },
  { value: 'address.city', label: 'City', type: 'text' as FieldType },
  { value: 'skills', label: 'Skills', type: 'array' as FieldType },
]

const operatorOptionsByType: Record<FieldType, Array<{ value: FilterOperator; label: string }>> = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'notContains', label: 'Does not contain' },
  ],
  select: [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not equal' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not equal' },
    { value: 'greaterThan', label: 'Greater than' },
    { value: 'greaterThanOrEqual', label: 'Greater than or equal' },
    { value: 'lessThan', label: 'Less than' },
    { value: 'lessThanOrEqual', label: 'Less than or equal' },
    { value: 'between', label: 'Between' },
  ],
  date: [
    { value: 'equals', label: 'Equals' },
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
    { value: 'between', label: 'Between' },
  ],
  boolean: [
    { value: 'equals', label: 'Is' },
  ],
  array: [
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Does not contain' },
  ],
}

const selectOptions = {
  department: ['Engineering', 'Operations', 'Finance', 'HR', 'Marketing', 'Sales', 'Legal', 'Design'],
  status: ['Active', 'Inactive', 'On Leave', 'Probation'],
}

type FilterValueInputProps = {
  field: string
  value: string
  value2?: string
  onChange: (value: string) => void
  onChangeSecond?: (value: string) => void
  error?: string
  operator?: FilterOperator
}

function getFieldType(field: string): FieldType {
  return fieldOptions.find((option) => option.value === field)?.type ?? 'text'
}

function getOperatorOptions(field: string) {
  return operatorOptionsByType[getFieldType(field)] ?? operatorOptionsByType.text
}

function FilterValueInput({ field, value, value2, onChange, onChangeSecond, error, operator }: FilterValueInputProps) {
  const type = getFieldType(field)

  if (operator === 'between' && (type === 'number' || type === 'date')) {
    return (
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          type={type === 'number' ? 'number' : 'date'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={type === 'number' ? 'Min' : 'Start'}
          error={Boolean(error)}
          helperText={error}
        />
        <TextField
          size="small"
          type={type === 'number' ? 'number' : 'date'}
          value={value2 ?? ''}
          onChange={(event) => onChangeSecond?.(event.target.value)}
          placeholder={type === 'number' ? 'Max' : 'End'}
          error={Boolean(error)}
        />
      </Stack>
    )
  }

  if (type === 'boolean') {
    return (
      <FormControl size="small" error={Boolean(error)}>
        <Select value={value} onChange={(event) => onChange(event.target.value)}>
          <MenuItem value="true">True</MenuItem>
          <MenuItem value="false">False</MenuItem>
        </Select>
        {error ? <FormHelperText>{error}</FormHelperText> : null}
      </FormControl>
    )
  }

  if (type === 'select') {
    return (
      <FormControl size="small" error={Boolean(error)}>
        <Select value={value} onChange={(event) => onChange(event.target.value)}>
          {(selectOptions[field as keyof typeof selectOptions] ?? []).map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        {error ? <FormHelperText>{error}</FormHelperText> : null}
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
        error={Boolean(error)}
        helperText={error}
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
        error={Boolean(error)}
        helperText={error}
      />
    )
  }

  return (
    <TextField
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Enter value"
      error={Boolean(error)}
      helperText={error}
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

  const clearFilters = () => {
    setFilters([])
  }

  const removeFilter = (id: number) => {
    setFilters((current) => current.filter((filter) => filter.id !== id))
  }

  const validateFilter = (filter: FilterRow) => {
    const fieldType = getFieldType(filter.field)

    if (!filter.field) {
      return 'Please choose a field.'
    }

    if (!filter.operator) {
      return 'Please choose an operator.'
    }

    if (filter.value === '' || filter.value === null) {
      return 'Please enter a value.'
    }

    if (filter.operator === 'between' && (!filter.value2 || filter.value2 === '')) {
      return 'Please enter both range values.'
    }

    if (fieldType === 'number') {
      if (Number.isNaN(Number(filter.value))) {
        return 'Enter a valid number.'
      }
    }

    if (fieldType === 'date' && Number.isNaN(Date.parse(filter.value))) {
      return 'Enter a valid date.'
    }

    if (fieldType === 'boolean' && !['true', 'false'].includes(filter.value)) {
      return 'Choose true or false.'
    }

    return ''
  }

  useEffect(() => {
    onChange?.(
      filters
        .filter((filter) => validateFilter(filter) === '')
        .map((filter) => ({
          id: filter.id,
          field: filter.field,
          operator: filter.operator,
          value: filter.value,
          value2: filter.value2,
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
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={clearFilters} disabled={!filters.length}>
            Clear All
          </Button>
          <Button variant="contained" onClick={addFilter}>
            Add Filter
          </Button>
        </Stack>
      </Box>

      <Stack spacing={2}>
        {filters.map((filter) => {
          const validationMessage = validateFilter(filter)

          return (
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

            <Box>
              <FilterValueInput
                field={filter.field}
                value={filter.value}
                value2={filter.value2}
                onChange={(value) => updateFilter(filter.id, 'value', value)}
                onChangeSecond={(value) => updateFilter(filter.id, 'value2', value)}
                error={validateFilter(filter)}
                operator={filter.operator}
              />
            </Box>

            <Button color="inherit" onClick={() => removeFilter(filter.id)}>
              Remove
            </Button>

            {validationMessage ? (
              <Typography variant="caption" color="error" sx={{ gridColumn: '1 / -1' }}>
                {validationMessage}
              </Typography>
            ) : null}
          </Box>
          )
        })}
      </Stack>

      {filters.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Chip label={`${filters.length} active filter${filters.length > 1 ? 's' : ''}`} />
        </Box>
      )}
    </Paper>
  )
}
