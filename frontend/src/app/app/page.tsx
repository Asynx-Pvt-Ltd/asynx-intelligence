// Main app dashboard
// Entry point after authentication

export default function AppDashboard() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">$45,231</p>
          <p className="text-sm text-muted-foreground mt-2">+20.1% from last month</p>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Users</h3>
          <p className="text-3xl font-bold">2,350</p>
          <p className="text-sm text-muted-foreground mt-2">+180 from last month</p>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold">3.2%</p>
          <p className="text-sm text-muted-foreground mt-2">+0.3% from last month</p>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Churn Rate</h3>
          <p className="text-3xl font-bold">0.8%</p>
          <p className="text-sm text-muted-foreground mt-2">-0.2% from last month</p>
        </div>
      </div>
    </div>
  )
}
