import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { LayoutDashboard, FileText, Settings } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-card text-card-foreground flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Odokoid</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            activeProps={{ className: 'bg-accent text-accent-foreground' }}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            activeProps={{ className: 'bg-accent text-accent-foreground' }}
          >
            <FileText className="w-5 h-5" />
            <span>Forms</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            activeProps={{ className: 'bg-accent text-accent-foreground' }}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
