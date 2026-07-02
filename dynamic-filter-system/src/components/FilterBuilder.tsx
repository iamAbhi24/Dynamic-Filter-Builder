import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import type { FilterCondition, FilterOperator, FilterValue } from '../utils/filterEngine'

type FieldType = 'text' | 'number' | 'date' | 'currency' | 'singleSelect' | 'multiSelect' | 'boolean'

type OperatorOption = {
  value: FilterOperator
  label: string
}

type FieldDefinition = {
  value: string
  label: string
  type: FieldType
  options?: string[]
}

export type FilterRow = {
  id: number
  field: string
  operator: FilterOperator
  value: FilterValue
  value2?: FilterValue
}

const fieldDefinitions: FieldDefinition[] = [
  { value: 'name', label: 'Name', type: 'text' },
  { value: 'address.city', label: 'City', type: 'text' },
  { value: 'projects', label: 'Projects', type: 'number' },
  { value: 'hoursPerWeek', label: 'Hours per Week', type: 'number' },
  { value: 'joinDate', label: 'Join Date', type: 'date' },
  { value: 'salary', label: 'Salary', type: 'currency' },
  {
    value: 'department',
    label: 'Department',
    type: 'singleSelect',
    options: ['Engineering', 'Operations', 'Finance', 'HR', 'Marketing', 'Sales', 'Legal', 'Design'],
  },
  {
    value: 'status',
    label: 'Status',
    type: 'singleSelect',
    options: ['Active', 'Inactive', 'On Leave', 'Probation'],
  },
  {
    value: 'skills',
    label: 'Skills',
    type: 'multiSelect',
    options: [
      'Agile',
      'Analytics',
      'AWS',
      'Azure',
      'Communication',
      'CRM',
      'Docker',
      'Excel',
      'Figma',
      'Forecasting',
      'GraphQL',
      'HRIS',
      'Leadership',
      'Node.js',
      'People Ops',
      'Python',
      'React',
      'Recruiting',
      'Research',
      'SQL',
      'Strategy',
      'Tableau',
      'Testing',
      'TypeScript',
      'UI/UX',
    ],
  },
  { value: 'isActive', label: 'Active', type: 'boolean' },
]

const operatorOptionsByType: Record<FieldType, OperatorOption[]> = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'notContains', label: 'Does not contain' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'greaterThan', label: 'Greater than' },
    { value: 'lessThan', label: 'Less than' },
    { value: 'greaterThanOrEqual', label: 'Greater than or equal' },
    { value: 'lessThanOrEqual', label: 'Less than or equal' },
  ],
  date: [{ value: 'between', label: 'Between' }],
  currency: [{ value: 'between', label: 'Between' }],
  singleSelect: [
    { value: 'equals', label: 'Is' },
    { value: 'notEquals', label: 'Is not' },
  ],
  multiSelect: [
    { value: 'in', label: 'In' },
    { value: 'notIn', label: 'Not in' },
  ],
  boolean: [{ value: 'equals', label: 'Is' }],
}

type FilterValueInputProps = {
  field: FieldDefinition
  operator: FilterOperator
  value: FilterValue
  value2?: FilterValue
  error?: string
  onChange: (value: FilterValue) => void
  onChangeSecond: (value: FilterValue) => void
}

type FilterBuilderProps = {
  onChange?: (filters: FilterCondition[]) => void
}

function getFieldDefinition(field: string): FieldDefinition {
  return fieldDefinitions.find((option) => option.value === field) ?? fieldDefinitions[0]
}

function getOperatorOptions(field: string) {
  return operatorOptionsByType[getFieldDefinition(field).type]
}

function getDefaultValue(field: FieldDefinition): FilterValue {
  if (field.type === 'multiSelect') {
    return []
  }

  if (field.type === 'boolean') {
    return true
  }

  return ''
}

function createFilterRow(id: number, field = fieldDefinitions[0]): FilterRow {
  return {
    id,
    field: field.value,
    operator: operatorOptionsByType[field.type][0].value,
    value: getDefaultValue(field),
    value2: field.type === 'date' || field.type === 'currency' ? '' : undefined,
  }
}

function asString(value: FilterValue) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

function asStringArray(value: FilterValue) {
  return Array.isArray(value) ? value : []
}

function isBlank(value: FilterValue) {
  return value === '' || value === null || (Array.isArray(value) && value.length === 0)
}

function isValidNumber(value: FilterValue) {
  return !isBlank(value) && Number.isFinite(Number(value))
}

function isValidDate(value: FilterValue) {
  return typeof value === 'string' && value !== '' && Number.isFinite(Date.parse(value))
}

function validateFilter(filter: FilterRow) {
  const field = getFieldDefinition(filter.field)

  if (!filter.field) {
    return 'Please choose a field.'
  }

  if (!filter.operator) {
    return 'Please choose an operator.'
  }

  if (field.type === 'multiSelect') {
    return asStringArray(filter.value).length > 0 ? '' : 'Choose at least one option.'
  }

  if (field.type === 'boolean') {
    return typeof filter.value === 'boolean' ? '' : 'Choose true or false.'
  }

  if (field.type === 'date') {
    if (!isValidDate(filter.value) || !isValidDate(filter.value2 ?? null)) {
      return 'Choose a valid start and end date.'
    }

    return Date.parse(asString(filter.value)) <= Date.parse(asString(filter.value2 ?? '')) ? '' : 'Start date must be before end date.'
  }

  if (field.type === 'currency') {
    if (!isValidNumber(filter.value) || !isValidNumber(filter.value2 ?? null)) {
      return 'Enter valid minimum and maximum amounts.'
    }

    return Number(filter.value) <= Number(filter.value2) ? '' : 'Minimum amount must be less than maximum amount.'
  }

  if (isBlank(filter.value)) {
    return 'Please enter a value.'
  }

  if (field.type === 'number' && !isValidNumber(filter.value)) {
    return 'Enter a valid number.'
  }

  return ''
}

function toFilterCondition(filter: FilterRow): FilterCondition {
  const field = getFieldDefinition(filter.field)

  if (field.type === 'boolean') {
    return { ...filter, value: Boolean(filter.value) }
  }

  return filter
}

function FilterValueInput({ field, operator, value, value2, error, onChange, onChangeSecond }: FilterValueInputProps) {
  if (field.type === 'date' && operator === 'between') {
    return (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          fullWidth
          size="small"
          type="date"
          label="Start date"
          value={asString(value)}
          onChange={(event) => onChange(event.target.value)}
          error={Boolean(error)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          fullWidth
          size="small"
          type="date"
          label="End date"
          value={asString(value2 ?? '')}
          onChange={(event) => onChangeSecond(event.target.value)}
          error={Boolean(error)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>
    )
  }

  if (field.type === 'currency' && operator === 'between') {
    return (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Min amount"
          value={asString(value)}
          onChange={(event) => onChange(event.target.value)}
          error={Boolean(error)}
          slotProps={{
            htmlInput: { min: 0, step: '0.01' },
            input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
          }}
        />
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Max amount"
          value={asString(value2 ?? '')}
          onChange={(event) => onChangeSecond(event.target.value)}
          error={Boolean(error)}
          slotProps={{
            htmlInput: { min: 0, step: '0.01' },
            input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
          }}
        />
      </Stack>
    )
  }

  if (field.type === 'singleSelect') {
    return (
      <FormControl fullWidth size="small" error={Boolean(error)}>
        <Select value={asString(value)} displayEmpty onChange={(event) => onChange(event.target.value)}>
          <MenuItem value="" disabled>
            Choose {field.label.toLowerCase()}
          </MenuItem>
          {(field.options ?? []).map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }

  if (field.type === 'multiSelect') {
    const selectedValues = asStringArray(value)

    return (
      <FormControl fullWidth size="small" error={Boolean(error)}>
        <Select
          multiple
          value={selectedValues}
          displayEmpty
          renderValue={(selected) => (selected.length ? selected.join(', ') : `Choose ${field.label.toLowerCase()}`)}
          onChange={(event) => {
            const nextValue = event.target.value
            onChange(typeof nextValue === 'string' ? nextValue.split(',') : nextValue)
          }}
        >
          {(field.options ?? []).map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox checked={selectedValues.includes(option)} />
              <ListItemText primary={option} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }

  if (field.type === 'boolean') {
    return (
      <FormControl error={Boolean(error)}>
        <FormControlLabel
          control={<Switch checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />}
          label={value ? 'True' : 'False'}
        />
      </FormControl>
    )
  }

  if (field.type === 'number') {
    return (
      <TextField
        fullWidth
        size="small"
        type="number"
        value={asString(value)}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter number"
        error={Boolean(error)}
      />
    )
  }

  return (
    <TextField
      fullWidth
      size="small"
      value={asString(value)}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Enter text"
      error={Boolean(error)}
    />
  )
}

export function FilterBuilder({ onChange }: FilterBuilderProps) {
  const [filters, setFilters] = useState<FilterRow[]>([createFilterRow(1)])

  const addFilter = () => {
    setFilters((current) => [...current, createFilterRow(Date.now(), fieldDefinitions[6])])
  }

  const clearFilters = () => {
    setFilters([])
  }

  const removeFilter = (id: number) => {
    setFilters((current) => current.filter((filter) => filter.id !== id))
  }

  useEffect(() => {
    onChange?.(
      filters
        .filter((filter) => validateFilter(filter) === '')
        .map((filter) => toFilterCondition(filter)),
    )
  }, [filters, onChange])

  const updateFilter = (id: number, key: keyof FilterRow, value: FilterValue) => {
    setFilters((current) =>
      current.map((filter) => {
        if (filter.id !== id) {
          return filter
        }

        if (key === 'field' && typeof value === 'string') {
          return createFilterRow(filter.id, getFieldDefinition(value))
        }

        if (key === 'operator' && typeof value === 'string') {
          const field = getFieldDefinition(filter.field)
          return {
            ...filter,
            operator: value as FilterOperator,
            value: getDefaultValue(field),
            value2: field.type === 'date' || field.type === 'currency' ? '' : undefined,
          }
        }

        return { ...filter, [key]: value }
      }),
    )
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
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
          const field = getFieldDefinition(filter.field)
          const validationMessage = validateFilter(filter)

          return (
            <Box
              key={filter.id}
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr minmax(280px, 1.7fr) auto' },
                alignItems: 'start',
              }}
            >
              <FormControl size="small" fullWidth>
                <Select value={filter.field} onChange={(event) => updateFilter(filter.id, 'field', event.target.value)}>
                  {fieldDefinitions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <Select value={filter.operator} onChange={(event) => updateFilter(filter.id, 'operator', event.target.value)}>
                  {getOperatorOptions(filter.field).map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box>
                <FilterValueInput
                  field={field}
                  operator={filter.operator}
                  value={filter.value}
                  value2={filter.value2}
                  onChange={(nextValue) => updateFilter(filter.id, 'value', nextValue)}
                  onChangeSecond={(nextValue) => updateFilter(filter.id, 'value2', nextValue)}
                  error={validationMessage}
                />
                {validationMessage ? <FormHelperText error>{validationMessage}</FormHelperText> : null}
              </Box>

              <Button color="inherit" onClick={() => removeFilter(filter.id)}>
                Remove
              </Button>
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
