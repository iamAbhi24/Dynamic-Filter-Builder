import { fieldDefinitions, operatorOptionsByType } from '../config/filterConfig'
import type { FieldDefinition, FilterCondition, FilterRow, FilterValue } from '../types/filters'

export function getDefaultFilterValue(field: FieldDefinition): FilterValue {
  if (field.type === 'multiSelect') {
    return []
  }

  if (field.type === 'boolean') {
    return true
  }

  return ''
}

export function createFilterRow(id: number, field = fieldDefinitions[0]): FilterRow {
  return {
    id,
    field: field.value,
    operator: operatorOptionsByType[field.type][0].value,
    value: getDefaultFilterValue(field),
    value2: field.type === 'date' || field.type === 'currency' ? '' : undefined,
  }
}

export function toFilterCondition(filter: FilterRow): FilterCondition {
  if (typeof filter.value === 'boolean') {
    return { ...filter, value: Boolean(filter.value) }
  }

  return filter
}
