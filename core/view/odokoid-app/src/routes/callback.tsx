import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import { Loader2 } from 'lucide-react'
import { useApi } from '@/lib/useApi'

export const Route = createFileRoute('/callback')({
  component: CallbackPage,
})

function CallbackPage() {
  const { user, isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()
  const api = useApi()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const syncUser = async () => {
        try {
          if (user?.sub && user?.email) {
            await api.syncUser({ id: user.sub, email: user.email })
          }
        } catch (error) {
          console.error('Failed to sync user:', error)
        }
        navigate({ to: '/' })
      }
      syncUser()
    } else if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, isLoading, navigate, user, api])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  )
}
