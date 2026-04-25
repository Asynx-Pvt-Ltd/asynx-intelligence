// Billing feature page

export default function BillingPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
      <p className="text-muted-foreground mb-8">Manage your subscription and billing information</p>

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-lg">Pro Plan</p>
              <p className="text-sm text-muted-foreground">$49/month • Renews on Jan 1, 2024</p>
            </div>
            <button className="px-4 py-2 border rounded-md hover:bg-muted">Manage Plan</button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">•••• •••• •••• 4242</p>
              <p className="text-sm text-muted-foreground">Expires 12/24</p>
            </div>
            <button className="px-4 py-2 border rounded-md hover:bg-muted">Update</button>
          </div>
        </div>

        {/* Billing History */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Billing History</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Pro Plan</p>
                  <p className="text-sm text-muted-foreground">Dec {i}, 2023</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$49.00</p>
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
