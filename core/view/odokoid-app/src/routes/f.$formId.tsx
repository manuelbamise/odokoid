import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/f/$formId')({
  component: FormRenderer,
})

function FormRenderer() {
  const params = useParams({ from: '/f/$formId' })
  const formId = (params as { formId: string }).formId

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Form</h1>
      <p className="text-muted-foreground mt-2">Form ID: {formId}</p>
    </div>
  )
}
