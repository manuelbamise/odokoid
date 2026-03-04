import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FileText, MoreVertical, Copy, Trash2, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import type { Form } from '@/types/form'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function EmptyState({ onCreateForm }: { onCreateForm: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 mb-6 rounded-full bg-muted flex items-center justify-center">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No forms yet</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        Create your first form to get started
      </p>
      <Button onClick={onCreateForm}>
        <Plus className="h-4 w-4 mr-2" />
        Create Form
      </Button>
    </div>
  )
}

function FormCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-8 w-8 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-32 mt-3" />
      </CardContent>
    </Card>
  )
}

function FormCard({
  form,
  onEdit,
  onCopyLink,
  onDelete,
}: {
  form: Form
  onEdit: (id: string) => void
  onCopyLink: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { data: countData } = useQuery({
    queryKey: queryKeys.forms.submissionCount(form.id),
    queryFn: () => api.countSubmissions(form.id),
  })

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-1">
          {form.title}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(form.id)}>
              <FileText className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopyLink(form.id)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(form.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {form.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {form.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{form.fields.length} fields</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{countData?.count ?? 0} submissions</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Created {formatDate(form.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newFormTitle, setNewFormTitle] = useState('')
  const [newFormDescription, setNewFormDescription] = useState('')

  const { data: forms = [], isLoading } = useQuery({
    queryKey: queryKeys.forms.all,
    queryFn: api.listForms,
  })

  const createForm = useMutation({
    mutationFn: (data: { title: string; description?: string; fields: unknown[] }) =>
      api.createForm(data),
    onSuccess: (form) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all })
      setIsCreateDialogOpen(false)
      setNewFormTitle('')
      setNewFormDescription('')
      navigate({ to: '/forms/$formId/edit', params: { formId: form.id } })
    },
  })

  const deleteForm = useMutation({
    mutationFn: api.deleteForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all })
    },
  })

  const handleCreateForm = () => {
    if (!newFormTitle.trim()) return

    createForm.mutate({
      title: newFormTitle.trim(),
      description: newFormDescription.trim() || undefined,
      fields: [],
    })
  }

  const handleEdit = (id: string) => {
    navigate({ to: '/forms/$formId/edit', params: { formId: id } })
  }

  const handleCopyLink = async (id: string) => {
    const link = `${window.location.origin}/f/${id}`
    await navigator.clipboard.writeText(link)
  }

  const handleDelete = (id: string) => {
    deleteForm.mutate(id)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Manage your forms</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Form
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <FormCardSkeleton />
          <FormCardSkeleton />
          <FormCardSkeleton />
        </div>
      ) : forms.length === 0 ? (
        <EmptyState onCreateForm={() => setIsCreateDialogOpen(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onEdit={handleEdit}
              onCopyLink={handleCopyLink}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              Give your form a title and optional description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Form Title</Label>
              <Input
                id="title"
                placeholder="Enter form title"
                value={newFormTitle}
                onChange={(e) => setNewFormTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateForm()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Enter form description"
                value={newFormDescription}
                onChange={(e) => setNewFormDescription(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateForm()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateForm}
              disabled={!newFormTitle.trim() || createForm.isPending}
            >
              {createForm.isPending ? 'Creating...' : 'Create Form'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
