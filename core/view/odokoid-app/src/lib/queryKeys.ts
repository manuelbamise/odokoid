export const queryKeys = {
  forms: {
    all: ['forms'] as const,
    detail: (id: string) => ['forms', id] as const,
    submissions: (id: string) => ['forms', id, 'submissions'] as const,
    submissionCount: (id: string) => ['forms', id, 'submissions', 'count'] as const,
  },
}
