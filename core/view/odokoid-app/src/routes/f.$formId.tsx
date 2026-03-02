import { createFileRoute } from '@tanstack/react-router'
import { FormRenderer } from '@/components/renderer'

export const Route = createFileRoute('/f/$formId')({
  component: PublicFormPage,
})

function PublicFormPage() {
  const { formId } = Route.useParams()
  return <FormRenderer formId={formId} />
}
