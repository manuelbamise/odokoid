import type { Form, FormSubmission } from '@/types/form'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

async function request<T>(path: string, options?: RequestInit & { token?: string }): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
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
  listForms: (token?: string) => request<Form[]>('/api/forms', { token }),
  getForm: (id: string, token?: string) => request<Form>(`/api/forms/${id}`, { token }),
  createForm: (body: { title: string; description?: string; fields: unknown[] }, token?: string) =>
    request<Form>('/api/forms', { method: 'POST', body: JSON.stringify(body), token }),
  updateForm: (id: string, body: { title: string; description?: string; fields: unknown[] }, token?: string) =>
    request<Form>(`/api/forms/${id}`, { method: 'PUT', body: JSON.stringify(body), token }),
  deleteForm: (id: string, token?: string) =>
    request<void>(`/api/forms/${id}`, { method: 'DELETE', token }),

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
