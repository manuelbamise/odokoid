import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ThankYouScreenProps {
  onSubmitAnother: () => void
}

export function ThankYouScreen({ onSubmitAnother }: ThankYouScreenProps) {
  return (
    <div className="text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-6">
        <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>
      <h1 className="text-2xl font-bold mb-2">You're all done!</h1>
      <p className="text-muted-foreground mb-8">Your response has been recorded.</p>
      <Button onClick={onSubmitAnother} size="lg">
        Submit another response
      </Button>
    </div>
  )
}
