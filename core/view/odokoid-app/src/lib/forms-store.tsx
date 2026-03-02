import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Form } from '@/types/form'

const initialForms: Form[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'Customer Feedback Form',
    description: 'Collect feedback from your customers',
    fields: [
      { id: 'f1', type: 'text', label: 'Name', required: true },
      { id: 'f2', type: 'email', label: 'Email', required: true },
      { id: 'f3', type: 'multiselect', label: 'Rating', options: ['1', '2', '3', '4', '5'], required: false },
    ],
    createdAt: '2026-02-15T10:30:00Z',
    updatedAt: '2026-02-20T14:45:00Z',
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    title: 'Event Registration',
    description: 'Register for upcoming events',
    fields: [
      { id: 'f1', type: 'text', label: 'Full Name', required: true },
      { id: 'f2', type: 'email', label: 'Email', required: true },
      { id: 'f3', type: 'date', label: 'Preferred Date', required: true },
    ],
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    title: 'Job Application',
    description: 'Apply for open positions',
    fields: [
      { id: 'f1', type: 'text', label: 'Position', required: true },
      { id: 'f2', type: 'text', label: 'Years of Experience', required: false },
      { id: 'f3', type: 'select', label: 'Availability', options: ['Full-time', 'Part-time', 'Contract'], required: true },
    ],
    createdAt: '2026-01-28T16:20:00Z',
    updatedAt: '2026-02-01T11:30:00Z',
  },
]

interface FormStore {
  forms: Form[]
  getForm: (id: string) => Form | undefined
  addForm: (form: Form) => void
  updateForm: (id: string, updates: Partial<Form>) => void
  deleteForm: (id: string) => void
}

const FormStoreContext = createContext<FormStore | null>(null)

export function FormStoreProvider({ children }: { children: ReactNode }) {
  const [forms, setForms] = useState<Form[]>(initialForms)

  const getForm = (id: string) => forms.find((f) => f.id === id)

  const addForm = (form: Form) => {
    setForms((prev) => [form, ...prev])
  }

  const updateForm = (id: string, updates: Partial<Form>) => {
    setForms((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
      )
    )
  }

  const deleteForm = (id: string) => {
    setForms((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <FormStoreContext.Provider value={{ forms, getForm, addForm, updateForm, deleteForm }}>
      {children}
    </FormStoreContext.Provider>
  )
}

export function useFormStore() {
  const context = useContext(FormStoreContext)
  if (!context) {
    throw new Error('useFormStore must be used within a FormStoreProvider')
  }
  return context
}
