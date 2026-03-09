import { useAuth0 } from '@auth0/auth0-react';
import { api } from './api';

export function useApi() {
  const { getAccessTokenSilently } = useAuth0();

  async function withToken<T>(fn: (token: string) => Promise<T>): Promise<T> {
    try {
      const token = await getAccessTokenSilently();
      return fn(token);
    } catch {
      throw new Error('Failed to get access token');
    }
  }

  return {
    listForms: () => withToken((token) => api.listForms(token)),
    getForm: (id: string) => withToken((token) => api.getForm(id, token)),
    createForm: (body: {
      title: string;
      description?: string;
      fields: unknown[];
    }) => withToken((token) => api.createForm(body, token)),
    updateForm: (
      id: string,
      body: { title: string; description?: string; fields: unknown[] },
    ) => withToken((token) => api.updateForm(id, body, token)),
    deleteForm: (id: string) => withToken((token) => api.deleteForm(id, token)),
    submitForm: (formId: string, responses: Record<string, unknown>) =>
      api.submitForm(formId, responses),
    listSubmissions: (formId: string) => api.listSubmissions(formId),
    countSubmissions: (formId: string) => api.countSubmissions(formId),
    syncUser: (body: { id: string; email: string }) =>
      withToken((token) => api.syncUser(body, token)),
  };
}
