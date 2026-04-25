import type React from "react"
// App shell layout
// This wraps the entire authenticated application

import { AppSidebar } from "@/features/app-shell/components/app-sidebar"
import { AppHeader } from "@/features/app-shell/components/app-header"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar navigation */}
      <AppSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <AppHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
