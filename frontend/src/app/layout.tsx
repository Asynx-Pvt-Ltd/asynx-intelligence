import type React from "react"
import "./globals.css"

export const metadata = {
  title: "Asynx SaaS",
  description: "Production-ready SaaS template",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
