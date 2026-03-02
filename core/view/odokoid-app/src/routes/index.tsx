import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
import type { Form } from '@/types/form'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

const mockForms: Form[] = [
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
            <span>0 submissions</span>
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
  const [forms, setForms] = useState<Form[]>(mockForms)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newFormTitle, setNewFormTitle] = useState('')
  const [newFormDescription, setNewFormDescription] = useState('')

  const handleCreateForm = () => {
    if (!newFormTitle.trim()) return

    const newForm: Form = {
      id: crypto.randomUUID(),
      title: newFormTitle.trim(),
      description: newFormDescription.trim() || undefined,
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setForms((prev) => [newForm, ...prev])
    setIsCreateDialogOpen(false)
    setNewFormTitle('')
    setNewFormDescription('')
    navigate({ to: '/forms/$formId/edit', params: { formId: newForm.id } })
  }

  const handleEdit = (id: string) => {
    navigate({ to: '/forms/$formId/edit', params: { formId: id } })
  }

  const handleCopyLink = async (id: string) => {
    const link = `${window.location.origin}/f/${id}`
    await navigator.clipboard.writeText(link)
  }

  const handleDelete = (id: string) => {
    setForms((prev) => prev.filter((form) => form.id !== id))
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

      {forms.length === 0 ? (
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
            <Button onClick={handleCreateForm} disabled={!newFormTitle.trim()}>
              Create Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
