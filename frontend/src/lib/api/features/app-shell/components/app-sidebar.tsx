// App shell feature - Sidebar component
// This is part of the core app navigation infrastructure

import Link from "next/link"

export function AppSidebar() {
  const navigation = [
    { name: "Dashboard", href: "/app", icon: "📊" },
    { name: "Analytics", href: "/app/analytics", icon: "📈" },
    { name: "Billing", href: "/app/billing", icon: "💳" },
    { name: "Settings", href: "/app/settings", icon: "⚙️" },
  ]

  return (
    <aside className="w-64 border-r flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">Your SaaS</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button className="w-full px-3 py-2 text-left hover:bg-muted rounded-md">Sign Out</button>
      </div>
    </aside>
  )
}
