import type { Form, FormSubmission } from '@/types/form'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error ?? `Request failed with status ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  listForms: () => request<Form[]>('/api/forms'),
  getForm: (id: string) => request<Form>(`/api/forms/${id}`),
  createForm: (body: { title: string; description?: string; fields: unknown[] }) =>
    request<Form>('/api/forms', { method: 'POST', body: JSON.stringify(body) }),
  updateForm: (id: string, body: { title: string; description?: string; fields: unknown[] }) =>
    request<Form>(`/api/forms/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteForm: (id: string) =>
    request<void>(`/api/forms/${id}`, { method: 'DELETE' }),

  submitForm: (formId: string, responses: Record<string, unknown>) =>
    request<FormSubmission>(`/api/forms/${formId}/submissions`, {
      method: 'POST',
      body: JSON.stringify({ responses }),
    }),
  listSubmissions: (formId: string) =>
    request<FormSubmission[]>(`/api/forms/${formId}/submissions`),
  countSubmissions: (formId: string) =>
    request<{ count: number }>(`/api/forms/${formId}/submissions/count`),
}
