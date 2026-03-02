export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'boolean'

export type ValidationRule = {
  type: 'required' | 'min' | 'max' | 'pattern'
  value?: string | number
  message: string
}

export type ConditionalRule = {
  fieldId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'is_not_empty'
  value?: string
}

export type Field = {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  validation?: ValidationRule[]
  options?: string[]
  conditionalLogic?: ConditionalRule
}

export type Form = {
  id: string
  title: string
  description?: string
  fields: Field[]
  createdAt: string
  updatedAt: string
}

export type FormSubmission = {
  id: string
  formId: string
  responses: Record<string, unknown>
  submittedAt: string
}
