// App shell feature - Header component

export function AppHeader() {
  return (
    <header className="border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <input type="search" placeholder="Search..." className="px-4 py-2 border rounded-md w-80" />
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-muted rounded-md">🔔</button>
          <button className="p-2 hover:bg-muted rounded-md">👤</button>
        </div>
      </div>
    </header>
  )
}
