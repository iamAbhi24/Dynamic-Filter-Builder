import type { FilterValue } from '../types/filters'

export function asString(value: FilterValue) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

export function asStringArray(value: FilterValue) {
  return Array.isArray(value) ? value : []
}

export function isBlank(value: FilterValue) {
  return value === '' || value === null || (Array.isArray(value) && value.length === 0)
}

export function isValidNumber(value: FilterValue) {
  return !isBlank(value) && Number.isFinite(Number(value))
}

export function isValidDate(value: FilterValue) {
  return typeof value === 'string' && value !== '' && Number.isFinite(Date.parse(value))
}
