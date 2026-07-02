import type { FieldDefinition, FieldType, OperatorOption } from '../types/filters'

export const fieldDefinitions: FieldDefinition[] = [
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

export const operatorOptionsByType: Record<FieldType, OperatorOption[]> = {
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
    { value: 'between', label: 'Between' },
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

export function getFieldDefinition(field: string): FieldDefinition {
  return fieldDefinitions.find((option) => option.value === field) ?? fieldDefinitions[0]
}

export function getOperatorOptions(field: string) {
  return operatorOptionsByType[getFieldDefinition(field).type]
}
