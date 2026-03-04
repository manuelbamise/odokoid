import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate({ to: '/' })
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleLogin = () => {
    loginWithRedirect()
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Odokoid</CardTitle>
          <CardDescription>
            Sign in to create and manage your forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogin} className="w-full" size="lg">
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
