import { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import './App.css'
import { DataTable, type ColumnDefinition } from './components/DataTable'
import { FilterBuilder } from './components/FilterBuilder'

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
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    {
      key: 'salary',
      label: 'Salary',
      render: (value) => `$${Number(value).toLocaleString()}`,
    },
    {
      key: 'address',
      label: 'City',
      render: (value) => (value as Employee['address']).city,
    },
  ]

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
          <FilterBuilder />
          <Box sx={{ mb: 2, mt: 2 }}>
            <strong>{employees.length}</strong> employees loaded
          </Box>
          <DataTable rows={employees} columns={columns} emptyMessage="No employee records found." />
        </section>
      )}
    </main>
  )
}

export default App
