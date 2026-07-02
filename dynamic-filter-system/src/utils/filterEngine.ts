export type FilterOperator = 'contains' | 'equals' | 'notEquals' | 'startsWith' | 'endsWith' | 'notContains' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 'before' | 'after' | 'between' | 'in' | 'notIn'

export type FilterCondition = {
  id: number
  field: string
  operator: FilterOperator
  value: string | number | boolean | null
  value2?: string | number | boolean | null
}

function getValueByPath<T extends Record<string, unknown>>(item: T, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }

    return undefined
  }, item as unknown)
}

function normalizeString(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim().toLowerCase())
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  }

  return []
}

function compareValues(actual: unknown, expected: string | number | boolean | null, operator: FilterOperator, secondValue?: string | number | boolean | null) {
  if (operator === 'contains') {
    if (Array.isArray(actual)) {
      return normalizeArray(actual).includes(normalizeString(expected))
    }

    return normalizeString(actual).includes(normalizeString(expected))
  }

  if (operator === 'notContains') {
    if (Array.isArray(actual)) {
      return !normalizeArray(actual).includes(normalizeString(expected))
    }

    return !normalizeString(actual).includes(normalizeString(expected))
  }

  if (operator === 'startsWith') {
    return normalizeString(actual).startsWith(normalizeString(expected))
  }

  if (operator === 'endsWith') {
    return normalizeString(actual).endsWith(normalizeString(expected))
  }

  if (operator === 'equals') {
    if (typeof actual === 'number' && typeof expected === 'number') {
      return actual === expected
    }

    if (typeof actual === 'boolean' && typeof expected === 'boolean') {
      return actual === expected
    }

    return normalizeString(actual) === normalizeString(expected)
  }

  if (operator === 'notEquals') {
    if (typeof actual === 'number' && typeof expected === 'number') {
      return actual !== expected
    }

    if (typeof actual === 'boolean' && typeof expected === 'boolean') {
      return actual !== expected
    }

    return normalizeString(actual) !== normalizeString(expected)
  }

  if (operator === 'greaterThan') {
    const actualNumber = Number(actual)
    const expectedNumber = Number(expected)
    return Number.isFinite(actualNumber) && Number.isFinite(expectedNumber) && actualNumber > expectedNumber
  }

  if (operator === 'greaterThanOrEqual') {
    const actualNumber = Number(actual)
    const expectedNumber = Number(expected)
    return Number.isFinite(actualNumber) && Number.isFinite(expectedNumber) && actualNumber >= expectedNumber
  }

  if (operator === 'lessThan') {
    const actualNumber = Number(actual)
    const expectedNumber = Number(expected)
    return Number.isFinite(actualNumber) && Number.isFinite(expectedNumber) && actualNumber < expectedNumber
  }

  if (operator === 'lessThanOrEqual') {
    const actualNumber = Number(actual)
    const expectedNumber = Number(expected)
    return Number.isFinite(actualNumber) && Number.isFinite(expectedNumber) && actualNumber <= expectedNumber
  }

  if (operator === 'before') {
    const actualDate = Date.parse(String(actual))
    const expectedDate = Date.parse(String(expected))
    return Number.isFinite(actualDate) && Number.isFinite(expectedDate) && actualDate < expectedDate
  }

  if (operator === 'after') {
    const actualDate = Date.parse(String(actual))
    const expectedDate = Date.parse(String(expected))
    return Number.isFinite(actualDate) && Number.isFinite(expectedDate) && actualDate > expectedDate
  }

  if (operator === 'between') {
    const lowerBound = Number(expected)
    const upperBound = Number(secondValue)
    const actualNumber = Number(actual)

    if (Number.isFinite(actualNumber) && Number.isFinite(lowerBound) && Number.isFinite(upperBound)) {
      return actualNumber >= lowerBound && actualNumber <= upperBound
    }

    const actualDate = Date.parse(String(actual))
    const lowerDate = Date.parse(String(expected))
    const upperDate = Date.parse(String(secondValue))

    return Number.isFinite(actualDate) && Number.isFinite(lowerDate) && Number.isFinite(upperDate) && actualDate >= lowerDate && actualDate <= upperDate
  }

  if (operator === 'in') {
    const values = normalizeArray(expected)
    return values.length > 0 && values.includes(normalizeString(actual))
  }

  if (operator === 'notIn') {
    const values = normalizeArray(expected)
    return values.length === 0 || !values.includes(normalizeString(actual))
  }

  return false
}

export function matchesFilter<T extends Record<string, unknown>>(item: T, condition: FilterCondition) {
  const actualValue = getValueByPath(item, condition.field)
  return compareValues(actualValue, condition.value, condition.operator, condition.value2)
}

export function filterRows<T extends Record<string, unknown>>(rows: T[], filters: FilterCondition[]) {
  if (!filters.length) {
    return rows
  }

  const groupedFilters = filters.reduce<Record<string, FilterCondition[]>>((accumulator, condition) => {
    if (!accumulator[condition.field]) {
      accumulator[condition.field] = []
    }

    accumulator[condition.field].push(condition)
    return accumulator
  }, {})

  const fieldGroups = Object.values(groupedFilters)

  return rows.filter((row) => fieldGroups.every((fieldFilters) => fieldFilters.some((filter) => matchesFilter(row, filter))))
}
