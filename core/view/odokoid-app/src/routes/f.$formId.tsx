import { useState, useMemo, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { useFormStore } from '@/lib/forms-store'
import type { Field } from '@/types/form'

export const Route = createFileRoute('/f/$formId')({
  component: FormRenderer,
})

function evaluateCondition(field: Field, responses: Record<string, unknown>): boolean {
  const rule = field.conditionalLogic
  if (!rule) return true

  const dependentValue = responses[rule.fieldId]
  const conditionValue = rule.value

  switch (rule.operator) {
    case 'equals':
      return dependentValue === conditionValue
    case 'not_equals':
      return dependentValue !== conditionValue
    case 'contains':
      return String(dependentValue).includes(String(conditionValue))
    case 'is_empty':
      return dependentValue === undefined || dependentValue === '' || dependentValue === null
    case 'is_not_empty':
      return dependentValue !== undefined && dependentValue !== '' && dependentValue !== null
    default:
      return true
  }
}

function getVisibleFields(fields: Field[], responses: Record<string, unknown>): Field[] {
  return fields.filter((field) => evaluateCondition(field, responses))
}

function validateField(field: Field, value: unknown): string | null {
  if (field.required) {
    if (value === undefined || value === null || value === '') {
      return 'This field is required'
    }
  }

  if (value !== undefined && value !== null && value !== '') {
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(String(value))) {
        return 'Please enter a valid email address'
      }
    }

    if (field.type === 'number') {
      const numValue = Number(value)
      const minRule = field.validation?.find((v) => v.type === 'min')
      const maxRule = field.validation?.find((v) => v.type === 'max')

      if (minRule && minRule.value !== undefined && numValue < Number(minRule.value)) {
        return `Minimum value is ${minRule.value}`
      }
      if (maxRule && maxRule.value !== undefined && numValue > Number(maxRule.value)) {
        return `Maximum value is ${maxRule.value}`
      }
    }

    if (field.type === 'text' || field.type === 'email') {
      const maxRule = field.validation?.find((v) => v.type === 'max')
      if (maxRule && maxRule.value !== undefined && String(value).length > Number(maxRule.value)) {
        return `Maximum ${maxRule.value} characters allowed`
      }
    }
  }

  return null
}

interface FieldInputProps {
  field: Field
  value: unknown
  onChange: (value: unknown) => void
  error: string | null
  onEnter: () => void
}

function FieldInput({ field, value, onChange, error, onEnter }: FieldInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onEnter()
    }
  }

  if (field.type === 'select') {
    return (
      <RadioGroup
        value={String(value || '')}
        onValueChange={(val) => onChange(val)}
        className="space-y-3"
      >
        {field.options?.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={option} />
            <Label htmlFor={option} className="cursor-pointer text-base">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    )
  }

  if (field.type === 'multiselect') {
    const currentValues = Array.isArray(value) ? value : []
    return (
      <div className="space-y-3">
        {field.options?.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={option}
              checked={currentValues.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...currentValues, option])
                } else {
                  onChange(currentValues.filter((v: string) => v !== option))
                }
              }}
            />
            <Label htmlFor={option} className="cursor-pointer text-base">
              {option}
            </Label>
          </div>
        ))}
      </div>
    )
  }

  if (field.type === 'boolean') {
    const boolValue = value === true || value === 'true'
    return (
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`p-6 rounded-lg border-2 transition-all ${
            boolValue === true
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="text-2xl mb-2">✓</div>
          <div className="font-medium">Yes</div>
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`p-6 rounded-lg border-2 transition-all ${
            boolValue === false
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="text-2xl mb-2">✗</div>
          <div className="font-medium">No</div>
        </button>
      </div>
    )
  }

  if (field.type === 'number') {
    const minRule = field.validation?.find((v) => v.type === 'min')
    const maxRule = field.validation?.find((v) => v.type === 'max')
    return (
      <Input
        type="number"
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        onKeyDown={handleKeyDown}
        placeholder={field.placeholder}
        min={minRule?.value}
        max={maxRule?.value}
        className={error ? 'border-destructive' : ''}
      />
    )
  }

  if (field.type === 'date') {
    return (
      <Input
        type="date"
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value || undefined)}
        onKeyDown={handleKeyDown}
        className={error ? 'border-destructive' : ''}
      />
    )
  }

  return (
    <Input
      type={field.type === 'email' ? 'email' : 'text'}
      value={String(value || '')}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={field.placeholder}
      className={error ? 'border-destructive' : ''}
    />
  )
}

function ThankYouScreen({ onSubmitAnother }: { onSubmitAnother: () => void }) {
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

function FormRenderer() {
  const { formId } = Route.useParams()
  const { getForm } = useFormStore()

  const form = getForm(formId)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

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
      const submission = {
        formId,
        responses,
        submittedAt: new Date().toISOString(),
      }
      console.log('Form submitted:', submission)
      setIsSubmitted(true)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [validateCurrentField, isLastField, formId, responses])

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

  if (!form) {
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
      <div className={`w-full max-w-md transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
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
                {form.title}
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

              <Button onClick={handleNext}>
                {isLastField ? 'Submit' : 'Next'}
                {!isLastField && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
