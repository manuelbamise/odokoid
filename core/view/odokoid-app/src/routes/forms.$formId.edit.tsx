import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/forms/$formId/edit')({
  component: FormBuilder,
})

function FormBuilder() {
  const params = useParams({ from: Route.id })
  const formId = (params as { formId: string }).formId

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Form Builder</h1>
      <p className="text-muted-foreground mt-2">Editing form: {formId}</p>
    </div>
  )
}
