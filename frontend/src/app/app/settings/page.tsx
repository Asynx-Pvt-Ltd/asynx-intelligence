// Settings page

export default function SettingsPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <form className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" className="w-full px-3 py-2 border rounded-md" placeholder="john@example.com" />
            </div>
            <button type="submit" className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90">
              Save Changes
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Change Password</label>
              <button className="px-4 py-2 border rounded-md hover:bg-muted">Update Password</button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Two-Factor Authentication</label>
              <button className="px-4 py-2 border rounded-md hover:bg-muted">Enable 2FA</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
