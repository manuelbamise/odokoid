import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/callback')({
  component: CallbackPage,
})

function CallbackPage() {
  const { isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: '/' })
    } else if (!isLoading && !isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, isLoading, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  )
}
