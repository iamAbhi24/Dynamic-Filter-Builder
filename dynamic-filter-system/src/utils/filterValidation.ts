import { getFieldDefinition } from '../config/filterConfig'
import type { FilterRow } from '../types/filters'
import { asString, asStringArray, isBlank, isValidDate, isValidNumber } from './filterValueUtils'

export function validateFilter(filter: FilterRow) {
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

    // Date ranges need both valid dates and a sensible order.
    return Date.parse(asString(filter.value)) <= Date.parse(asString(filter.value2 ?? '')) ? '' : 'Start date must be before end date.'
  }

  if (field.type === 'currency') {
    if (!isValidNumber(filter.value) || !isValidNumber(filter.value2 ?? null)) {
      return 'Enter valid minimum and maximum amounts.'
    }

    // Keep range filters from silently returning no results because min and max are swapped.
    return Number(filter.value) <= Number(filter.value2) ? '' : 'Minimum amount must be less than maximum amount.'
  }

  if (field.type === 'number' && filter.operator === 'between') {
    if (!isValidNumber(filter.value) || !isValidNumber(filter.value2 ?? null)) {
      return 'Enter valid minimum and maximum numbers.'
    }

    // Number ranges use the same min <= max rule as currency ranges.
    return Number(filter.value) <= Number(filter.value2) ? '' : 'Minimum number must be less than maximum number.'
  }

  if (isBlank(filter.value)) {
    return 'Please enter a value.'
  }

  if (field.type === 'number' && !isValidNumber(filter.value)) {
    return 'Enter a valid number.'
  }

  return ''
}
