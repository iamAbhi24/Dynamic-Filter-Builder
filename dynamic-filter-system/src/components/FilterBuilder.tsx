import { useEffect, useState } from 'react'
import { Box, Button, Chip, FormControl, FormHelperText, MenuItem, Paper, Select, Stack, Typography } from '@mui/material'
import { Plus, Trash2, X } from 'lucide-react'
import { fieldDefinitions, getFieldDefinition, getOperatorOptions } from '../config/filterConfig'
import type { FilterCondition, FilterOperator, FilterRow, FilterValue } from '../types/filters'
import { createFilterRow, getDefaultFilterValue, toFilterCondition } from '../utils/filterState'
import { validateFilter } from '../utils/filterValidation'
import { FilterValueInput } from './FilterValueInput'

type FilterBuilderProps = {
  onChange?: (filters: FilterCondition[]) => void
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

          // Reset stale values when the new operator needs a different input shape.
          return {
            ...filter,
            operator: value as FilterOperator,
            value: getDefaultFilterValue(field),
            value2: field.type === 'date' || field.type === 'currency' || value === 'between' ? '' : undefined,
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
          <Button variant="outlined" startIcon={<X size={16} />} onClick={clearFilters} disabled={!filters.length}>
            Clear All
          </Button>
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={addFilter}>
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

              <Button color="inherit" startIcon={<Trash2 size={16} />} onClick={() => removeFilter(filter.id)}>
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
