import { useState, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
import { useFormStore } from '@/lib/forms-store'
import type { Field, FieldType } from '@/types/form'
import {
  FieldPaletteItem,
  fieldTypes,
  fieldTypeIcons,
  fieldTypeLabels,
  FormCanvas,
  FieldSettings,
} from '@/components/builder'

export const Route = createFileRoute('/forms/$formId/edit')({
  component: FormBuilderPage,
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
  const { formId } = Route.useParams()
  const { getForm, updateForm } = useFormStore()

  const form = getForm(formId)
  const isNew = formId === 'new'

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

  const handleSave = () => {
    if (form) {
      updateForm(form.id, { fields })
      console.log('Form saved:', { ...form, fields })
    }
  }

  const handlePreview = () => {
    window.open(`/f/${formId}`, '_blank')
  }

  if (!form && !isNew) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Form not found</p>
      </div>
    )
  }

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
            <h1 className="text-lg font-semibold">{form?.title || 'Untitled Form'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-[260px] border-r bg-card p-4 overflow-y-auto">
            <h2 className="text-sm font-semibold mb-4 text-muted-foreground">Field Types</h2>
            <div className="space-y-2">
              {fieldTypes.map((type) => (
                <FieldPaletteItem key={type} type={type} />
              ))}
            </div>
          </aside>

          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
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
