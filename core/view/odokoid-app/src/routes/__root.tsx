import { useState, useMemo } from 'react';
import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { LayoutDashboard, FileText, Menu, LogOut } from 'lucide-react';
import { Link, useMatchRoute } from '@tanstack/react-router';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth0();

  if (!isAuthenticated || !user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent w-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.picture || undefined} />
            <AvatarFallback>
              {user.name?.[0] || user.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{user.name}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="start">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <div className="mt-3 pt-3 border-t space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CollapsedUserMenu() {
  const { user, logout, isAuthenticated } = useAuth0();

  if (!isAuthenticated || !user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 hover:bg-accent rounded-md w-full flex justify-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.picture || undefined} />
            <AvatarFallback>
              {user.name?.[0] || user.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="start">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <div className="mt-3 pt-3 border-t space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

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

  const redirectUri =
    typeof window !== 'undefined' ? window.location.origin + '/callback' : '';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <ClientOnly>
          <Auth0Provider
            domain={
              import.meta.env.VITE_AUTH0_DOMAIN || 'your-tenant.auth0.com'
            }
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || 'your-client-id'}
            authorizationParams={{
              redirect_uri: redirectUri,
              scope: 'openid profile email',
            }}
          >
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
                      {sidebarOpen ? <UserMenu /> : <CollapsedUserMenu />}
                    </div>
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
          </Auth0Provider>
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
