import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/f/$formId')({
  component: FormRenderer,
})

function FormRenderer() {
  const { formId } = Route.useParams()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="border rounded-lg bg-card p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Form</h2>
          <p className="text-muted-foreground">Form ID: {formId}</p>
        </div>
        
        <div className="text-center text-muted-foreground">
          <p>Public form renderer will go here</p>
        </div>
      </div>
    </div>
  )
}
