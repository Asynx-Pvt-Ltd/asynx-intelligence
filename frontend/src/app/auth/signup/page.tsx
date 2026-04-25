// Auth feature - signup page

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center">Create Account</h1>
        <p className="text-muted-foreground text-center mb-8">Get started with your free account</p>

        <div className="border rounded-lg p-8">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input type="text" className="w-full px-4 py-2 border rounded-md" placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input type="email" className="w-full px-4 py-2 border rounded-md" placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input type="password" className="w-full px-4 py-2 border rounded-md" placeholder="••••••••" />
            </div>

            <button
              type="submit"
              className="w-full bg-foreground text-background py-3 rounded-md hover:opacity-90 font-medium"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <a href="/auth/login" className="underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
