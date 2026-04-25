// Landing page - public facing
// In advanced apps, this is often separate from the app shell

import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Welcome to Your SaaS Platform</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Built with a scalable, production-ready architecture
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/app" className="px-6 py-3 bg-foreground text-background rounded-md hover:opacity-90">
            Get Started
          </Link>
          <Link href="/auth/login" className="px-6 py-3 border rounded-md hover:bg-muted">
            Sign In
          </Link>
        </div>
      </section>
    </main>
  )
}
