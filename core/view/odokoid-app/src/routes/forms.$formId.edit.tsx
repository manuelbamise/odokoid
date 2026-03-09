import { useState, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { ArrowLeft, Eye, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useApi } from '@/lib/useApi'
import { queryKeys } from '@/lib/queryKeys'
import type { Field, FieldType } from '@/types/form'
import {
  FieldPaletteItem,
  fieldTypes,
  fieldTypeIcons,
  fieldTypeLabels,
  FormCanvas,
  FieldSettings,
} from '@/components/builder'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export const Route = createFileRoute('/forms/$formId/edit')({
  component: () => (
    <ProtectedRoute>
      <FormBuilderPage />
    </ProtectedRoute>
  ),
})

function createField(type: FieldType): Field {
  return {
    id: crypto.randomUUID(),
    type,
    label: '',
    placeholder: '',
    required: false,
    options: type === 'select' || type === 'multiselect' ? [] : undefined,
    validation: type === 'number' ? [] : undefined,
  }
}

function FormBuilderPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const api = useApi()
  const { formId } = Route.useParams()
  const isNew = formId === 'new'

  const { data: form, isLoading, error } = useQuery({
    queryKey: queryKeys.forms.detail(formId),
    queryFn: () => api.getForm(formId),
    enabled: !isNew,
  })

  const [fields, setFields] = useState<Field[]>(form?.fields || [])
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [activeDragType, setActiveDragType] = useState<FieldType | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const selectedField = useMemo(
    () => fields.find((f) => f.id === selectedFieldId) || null,
    [fields, selectedFieldId]
  )

  const updateForm = useMutation({
    mutationFn: (data: { title: string; description?: string; fields: unknown[] }) =>
      api.updateForm(formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(formId) })
      toast.success('Form saved successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save form')
    },
  })

  const handleDragStart = (event: DragStartEvent) => {
    const fieldType = event.active.data.current?.fieldType as FieldType | undefined
    if (fieldType) {
      setActiveDragType(fieldType)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null)
    
    const { active, over } = event
    
    if (!over) return

    const isFromPalette = active.data.current?.source === 'palette'
    const fieldType = active.data.current?.fieldType as FieldType | undefined
    
    if (isFromPalette && fieldType) {
      const newField = createField(fieldType)
      const overId = over.id.toString()
      
      if (overId === 'canvas' || !fields.some(f => f.id === overId)) {
        setFields((prev) => [...prev, newField])
      } else {
        const overIndex = fields.findIndex((f) => f.id === overId)
        setFields((prev) => {
          const newFields = [...prev]
          newFields.splice(overIndex, 0, newField)
          return newFields
        })
      }
      setSelectedFieldId(newField.id)
    } else if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleFieldUpdate = (fieldId: string, updates: Partial<Field>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    )
  }

  const handleFieldDelete = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId))
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null)
    }
  }

  const handleAddField = (type: FieldType) => {
    const newField = createField(type)
    setFields((prev) => [...prev, newField])
    setSelectedFieldId(newField.id)
  }

  const handleSave = () => {
    if (!form && !isNew) return

    updateForm.mutate({
      title: form?.title || 'Untitled Form',
      description: form?.description,
      fields: fields as unknown[],
    })
  }

  const handlePreview = () => {
    window.open(`/f/${formId}`, '_blank')
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Form not found</h2>
          <p className="text-muted-foreground mb-4">
            This form may have been deleted or the link is incorrect.
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-3 border-b bg-card">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-[260px] border-r bg-card p-4">
            <Skeleton className="h-4 w-24 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </aside>

          <div className="flex-1 p-6">
            <Skeleton className="h-8 w-64 mb-6" />
            <Skeleton className="h-32 w-full" />
          </div>

          <aside className="w-[300px] border-l bg-card p-4">
            <Skeleton className="h-full w-full" />
          </aside>
        </div>
      </div>
    )
  }

  const renderBuilderContent = () => (
    <>
      <div className="flex items-center justify-between px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{form?.title || 'Untitled Form'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={updateForm.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateForm.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[260px] border-r bg-card p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-4 text-muted-foreground">Field Types</h2>
          <div className="space-y-2">
            {fieldTypes.map((type) => (
              <FieldPaletteItem key={type} type={type} onAdd={handleAddField} />
            ))}
          </div>
        </aside>

        <div className="flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <input
                  className="text-2xl font-bold bg-transparent border-none outline-none w-full"
                  value={form?.title || ''}
                  placeholder="Form Title"
                  readOnly
                />
                {form?.description && (
                  <p className="text-muted-foreground mt-1">{form.description}</p>
                )}
              </div>
            </div>
          </div>
          <FormCanvas
            fields={fields}
            selectedFieldId={selectedFieldId}
            onSelectField={setSelectedFieldId}
            onDeleteField={handleFieldDelete}
            onUpdateField={handleFieldUpdate}
          />
        </div>

        <aside className="w-[300px] border-l bg-card p-4 overflow-y-auto">
          {selectedField ? (
            <FieldSettings
              field={selectedField}
              allFields={fields}
              onUpdate={(updates) => handleFieldUpdate(selectedField.id, updates)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Select a field to edit its settings
            </div>
          )}
        </aside>
      </div>
    </>
  )

  if (isNew) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-3 border-b bg-card">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-semibold">Untitled Form</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSave} disabled={updateForm.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateForm.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <aside className="w-[260px] border-r bg-card p-4 overflow-y-auto">
              <h2 className="text-sm font-semibold mb-4 text-muted-foreground">Field Types</h2>
              <div className="space-y-2">
                {fieldTypes.map((type) => (
                  <FieldPaletteItem key={type} type={type} onAdd={handleAddField} />
                ))}
              </div>
            </aside>

            <div className="flex-1 overflow-hidden">
              <div className="overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6">
                    <input
                      className="text-2xl font-bold bg-transparent border-none outline-none w-full"
                      placeholder="Form Title"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <FormCanvas
                fields={fields}
                selectedFieldId={selectedFieldId}
                onSelectField={setSelectedFieldId}
                onDeleteField={handleFieldDelete}
                onUpdateField={handleFieldUpdate}
              />
            </div>

            <aside className="w-[300px] border-l bg-card p-4 overflow-y-auto">
              {selectedField ? (
                <FieldSettings
                  field={selectedField}
                  allFields={fields}
                  onUpdate={(updates) => handleFieldUpdate(selectedField.id, updates)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Select a field to edit its settings
                </div>
              )}
            </aside>
          </div>
        </div>

        <DragOverlay>
          {activeDragType && (
            <div className="flex items-center gap-3 p-3 bg-card border rounded-lg shadow-lg">
              {(() => {
                const Icon = fieldTypeIcons[activeDragType]
                return <Icon className="h-4 w-4" />
              })()}
              <span className="text-sm font-medium">{fieldTypeLabels[activeDragType]}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {renderBuilderContent()}

      <DragOverlay>
        {activeDragType && (
          <div className="flex items-center gap-3 p-3 bg-card border rounded-lg shadow-lg">
            {(() => {
              const Icon = fieldTypeIcons[activeDragType]
              return <Icon className="h-4 w-4" />
            })()}
            <span className="text-sm font-medium">{fieldTypeLabels[activeDragType]}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
