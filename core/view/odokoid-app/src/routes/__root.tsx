import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { LayoutDashboard, FileText, Settings, Menu } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Odokoid - Form Builder',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootLayout,
})

function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <div className="flex h-screen">
          <aside
            className={`${sidebarOpen ? 'w-64' : 'w-16'} border-r bg-card transition-all duration-200 flex flex-col`}
          >
            <div className="p-4 border-b flex items-center justify-between">
              {sidebarOpen && (
                <h1 className="font-bold text-xl">Odokoid</h1>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-accent rounded-md"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="flex-1 p-2 space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent [&.active]:bg-accent"
              >
                <LayoutDashboard className="h-5 w-5" />
                {sidebarOpen && <span>Dashboard</span>}
              </Link>
              <Link
                to="/forms/$formId/edit"
                params={{ formId: 'new' }}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent [&.active]:bg-accent"
              >
                <FileText className="h-5 w-5" />
                {sidebarOpen && <span>New Form</span>}
              </Link>
            </nav>

            <div className="p-2 border-t">
              <button className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent w-full">
                <Settings className="h-5 w-5" />
                {sidebarOpen && <span>Settings</span>}
              </button>
            </div>
          </aside>

          <main className="flex-1 overflow-auto bg-background">
            <Outlet />
          </main>
        </div>

        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
         ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
