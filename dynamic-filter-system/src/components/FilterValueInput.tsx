import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputAdornment,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import type { FieldDefinition, FilterOperator, FilterValue } from '../types/filters'
import { asString, asStringArray } from '../utils/filterValueUtils'

type FilterValueInputProps = {
  field: FieldDefinition
  operator: FilterOperator
  value: FilterValue
  value2?: FilterValue
  error?: string
  onChange: (value: FilterValue) => void
  onChangeSecond: (value: FilterValue) => void
}

export function FilterValueInput({ field, operator, value, value2, error, onChange, onChangeSecond }: FilterValueInputProps) {
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

  if (field.type === 'number' && operator === 'between') {
    return (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Min"
          value={asString(value)}
          onChange={(event) => onChange(event.target.value)}
          error={Boolean(error)}
        />
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Max"
          value={asString(value2 ?? '')}
          onChange={(event) => onChangeSecond(event.target.value)}
          error={Boolean(error)}
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
