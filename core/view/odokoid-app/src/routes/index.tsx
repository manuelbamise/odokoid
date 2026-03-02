import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Manage your forms</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="font-semibold">Total Forms</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="font-semibold">Total Submissions</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="font-semibold">Active Forms</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
}
