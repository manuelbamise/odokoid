import type { Field } from '@/types/form'

export function evaluateCondition(field: Field, responses: Record<string, unknown>): boolean {
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

export function getVisibleFields(fields: Field[], responses: Record<string, unknown>): Field[] {
  return fields.filter((field) => evaluateCondition(field, responses))
}

export function validateField(field: Field, value: unknown): string | null {
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
