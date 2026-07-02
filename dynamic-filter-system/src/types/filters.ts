export type FilterOperator =
  | 'contains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'
  | 'notContains'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'before'
  | 'after'
  | 'between'
  | 'in'
  | 'notIn'

export type FilterValue = string | number | boolean | string[] | null

export type FilterCondition = {
  id: number
  field: string
  operator: FilterOperator
  value: FilterValue
  value2?: FilterValue
}

export type FieldType = 'text' | 'number' | 'date' | 'currency' | 'singleSelect' | 'multiSelect' | 'boolean'

export type OperatorOption = {
  value: FilterOperator
  label: string
}

export type FieldDefinition = {
  value: string
  label: string
  type: FieldType
  options?: string[]
}

export type FilterRow = FilterCondition
