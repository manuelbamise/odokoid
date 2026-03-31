import { api } from './api';

export function useApi() {
  return {
    listForms: () => api.listForms(),
    getForm: (id: string) => api.getForm(id),
    createForm: (body: { title: string; description?: string; fields: unknown[] }) =>
      api.createForm(body),
    updateForm: (id: string, body: { title: string; description?: string; fields: unknown[] }) =>
      api.updateForm(id, body),
    deleteForm: (id: string) => api.deleteForm(id),
    submitForm: (formId: string, responses: Record<string, unknown>) =>
      api.submitForm(formId, responses),
    listSubmissions: (formId: string) => api.listSubmissions(formId),
    countSubmissions: (formId: string) => api.countSubmissions(formId),
  };
}
