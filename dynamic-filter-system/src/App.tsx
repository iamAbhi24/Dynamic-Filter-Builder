import { useEffect, useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import './App.css'
import { DataTable, type ColumnDefinition } from './components/DataTable'
import { FilterBuilder } from './components/FilterBuilder.tsx'
import { filterRows, type FilterCondition } from './utils/filterEngine'

type Employee = {
  id: number
  name: string
  department: string
  role: string
  salary: number
  joinDate: string
  isActive: boolean
  status: string
  address: {
    city: string
    state: string
    country: string
  }
}

function App() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<FilterCondition[]>([])

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees')
        if (!response.ok) {
          throw new Error('Failed to fetch employee data')
        }
        const data = (await response.json()) as Employee[]
        setEmployees(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  const columns: ColumnDefinition<Employee>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    {
      key: 'salary',
      label: 'Salary',
      sortable: true,
      render: (value) => `$${Number(value).toLocaleString()}`,
    },
    {
      key: 'address',
      label: 'City',
      sortable: true,
      sortValue: (row) => row.address.city,
      render: (value) => (value as Employee['address']).city,
    },
  ]

  const filteredEmployees = useMemo(() => filterRows(employees, activeFilters), [employees, activeFilters])

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Dynamic Filter System</p>
          <Typography variant="h4" component="h1">
            Employee Directory
          </Typography>
        </div>
      </header>

      {loading && <p>Loading employees...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <section className="table-card">
          <FilterBuilder onChange={setActiveFilters} />
          <Box sx={{ mb: 2, mt: 2 }}>
            <strong>{filteredEmployees.length}</strong> employees matching filters
          </Box>
          <DataTable rows={filteredEmployees} columns={columns} emptyMessage="No employee records found." />
        </section>
      )}
    </main>
  )
}

export default App
