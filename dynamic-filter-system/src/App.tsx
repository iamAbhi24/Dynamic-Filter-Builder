import { useEffect, useState } from 'react'
import './App.css'

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

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Dynamic Filter System</p>
          <h1>Employee Directory</h1>
         
        </div>
      </header>

      {loading && <p>Loading employees...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <section className="table-card">
          <div className="table-summary">
            <strong>{employees.length}</strong> employees loaded
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Salary</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.department}</td>
                  <td>{employee.role}</td>
                  <td>{employee.status}</td>
                  <td>${employee.salary.toLocaleString()}</td>
                  <td>{employee.address.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  )
}

export default App
