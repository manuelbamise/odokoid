import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { FieldInput } from './FieldInput'
import { ThankYouScreen } from './ThankYouScreen'
import { getVisibleFields, validateField } from './utils'

export function FormRenderer({ formId }: { formId: string }) {
  const { data: form, isLoading, error } = useQuery({
    queryKey: queryKeys.forms.detail(formId),
    queryFn: () => api.getForm(formId),
  })

  const submitForm = useMutation({
    mutationFn: (responses: Record<string, unknown>) => api.submitForm(formId, responses),
    onSuccess: () => {
      setIsSubmitted(true)
    },
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const visibleFields = useMemo(
    () => getVisibleFields(form?.fields || [], responses),
    [form?.fields, responses]
  )

  const currentField = visibleFields[currentIndex]
  const progress = visibleFields.length > 0
    ? ((currentIndex + 1) / visibleFields.length) * 100
    : 0
  const isLastField = currentIndex === visibleFields.length - 1

  const handleResponseChange = useCallback((fieldId: string, value: unknown) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }, [errors])

  const validateCurrentField = useCallback((): boolean => {
    if (!currentField) return true

    const value = responses[currentField.id]
    const error = validateField(currentField, value)

    if (error) {
      setErrors((prev) => ({ ...prev, [currentField.id]: error }))
      return false
    }

    return true
  }, [currentField, responses])

  const handleNext = useCallback(() => {
    if (!validateCurrentField()) return

    if (isLastField) {
      submitForm.mutate(responses)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [validateCurrentField, isLastField, submitForm, responses])

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const handleSubmitAnother = useCallback(() => {
    setCurrentIndex(0)
    setResponses({})
    setErrors({})
    setIsSubmitted(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-8 w-64 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-10 w-24 ml-auto" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Form not found</h1>
          <p className="text-muted-foreground">
            This form may have been deleted or the link is incorrect.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        {!isSubmitted && visibleFields.length > 0 && (
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {currentIndex + 1} of {visibleFields.length}
            </p>
          </div>
        )}

        {isSubmitted ? (
          <ThankYouScreen onSubmitAnother={handleSubmitAnother} />
        ) : visibleFields.length === 0 ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">No fields available</h1>
            <p className="text-muted-foreground">
              This form has no visible fields.
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-2">
              <h1 className="text-sm font-medium text-muted-foreground">
                {form?.title}
              </h1>
            </div>

            <div className="mb-8">
              <Label className="text-xl font-semibold block mb-4">
                {currentField.label}
                {currentField.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              <FieldInput
                field={currentField}
                value={responses[currentField.id]}
                onChange={(value) => handleResponseChange(currentField.id, value)}
                error={errors[currentField.id] || null}
                onEnter={handleNext}
              />

              {errors[currentField.id] && (
                <p className="text-sm text-destructive mt-2">
                  {errors[currentField.id]}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <Button onClick={handleNext} disabled={submitForm.isPending}>
                {submitForm.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isLastField ? (
                  'Submit'
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
