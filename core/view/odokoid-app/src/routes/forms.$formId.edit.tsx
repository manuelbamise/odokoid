import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forms/$formId/edit')({
  component: FormBuilder,
})

function FormBuilder() {
  const { formId } = Route.useParams()
  const isNew = formId === 'new'

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          {isNew ? 'Create New Form' : 'Edit Form'}
        </h2>
        <p className="text-muted-foreground">
          {isNew ? 'Build your form by adding fields' : `Editing form: ${formId}`}
        </p>
      </div>

      <div className="border rounded-lg bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Form builder component will go here
        </p>
      </div>
    </div>
  )
}
