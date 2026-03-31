import { useState, useMemo } from 'react';
import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { LayoutDashboard, Menu } from 'lucide-react';
import { Link, useMatchRoute } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';

import { ClientOnly } from '@/components/ClientOnly';

import appCss from '../styles.css?url';

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

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
});

function RootLayout() {
  const matchRoute = useMatchRoute();

  const isBuilderRoute = useMemo(
    () => matchRoute({ to: '/forms/$formId/edit' }),
    [matchRoute],
  );
  const isPublicFormRoute = useMemo(
    () => matchRoute({ to: '/f/$formId' }),
    [matchRoute],
  );
  const [sidebarOpen, setSidebarOpen] = useState(!isBuilderRoute);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <ClientOnly>
          <QueryClientProvider client={queryClient}>
            <div className="flex h-screen">
              {!isBuilderRoute && !isPublicFormRoute && (
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
                  </nav>
                </aside>
              )}

              <main
                className={`flex-1 overflow-auto bg-background ${isBuilderRoute || isPublicFormRoute ? 'h-screen' : ''}`}
              >
                <Outlet />
              </main>
            </div>
            <Toaster />
          </QueryClientProvider>
        </ClientOnly>
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
  );
}
