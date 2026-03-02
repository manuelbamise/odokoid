import { useState, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowLeft,
  Eye,
  Save,
  GripVertical,
  Trash2,
  Type,
  Mail,
  Hash,
  Calendar,
  List,
  CheckSquare,
  ToggleLeft,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useFormStore } from '@/lib/forms-store'
import type { Field, FieldType } from '@/types/form'

export const Route = createFileRoute('/forms/$formId/edit')({
  component: FormBuilderPage,
})

const fieldTypeIcons: Record<FieldType, React.ElementType> = {
  text: Type,
  email: Mail,
  number: Hash,
  date: Calendar,
  select: List,
  multiselect: CheckSquare,
  boolean: ToggleLeft,
}

const fieldTypeLabels: Record<FieldType, string> = {
  text: 'Text',
  email: 'Email',
  number: 'Number',
  date: 'Date',
  select: 'Select',
  multiselect: 'Multi Select',
  boolean: 'Yes/No',
}

const fieldTypes: FieldType[] = ['text', 'email', 'number', 'date', 'select', 'multiselect', 'boolean']

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

interface DraggableFieldTypeProps {
  type: FieldType
}

function DraggableFieldType({ type }: DraggableFieldTypeProps) {
  const Icon = fieldTypeIcons[type]
  
  return (
    <div
      className="flex items-center gap-3 p-3 bg-card border rounded-lg cursor-grab hover:bg-accent hover:shadow-sm transition-all"
      data-field-type={type}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{fieldTypeLabels[type]}</span>
    </div>
  )
}

interface SortableFieldCardProps {
  field: Field
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onLabelChange: (label: string) => void
}

function SortableFieldCard({ field, isSelected, onSelect, onDelete, onLabelChange }: SortableFieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = fieldTypeIcons[field.type]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-card border rounded-lg transition-all ${
        isSelected ? 'border-primary ring-1 ring-primary' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      <button
        className="cursor-grab text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      
      <Icon className="h-4 w-4 text-muted-foreground" />
      
      <input
        className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
        value={field.label || 'Untitled field'}
        onChange={(e) => {
          e.stopPropagation()
          onLabelChange(e.target.value)
        }}
        onClick={(e) => e.stopPropagation()}
        placeholder="Field label"
      />
      
      <Badge variant="secondary" className="text-xs">
        {fieldTypeLabels[field.type]}
      </Badge>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface FieldSettingsProps {
  field: Field
  allFields: Field[]
  onUpdate: (updates: Partial<Field>) => void
}

function FieldSettings({ field, allFields, onUpdate }: FieldSettingsProps) {
  const otherFields = allFields.filter((f) => f.id !== field.id)
  const [conditionalOpen, setConditionalOpen] = useState(
    !!field.conditionalLogic
  )

  const hasOptions = field.type === 'select' || field.type === 'multiselect'
  const hasValidation = field.type === 'number'
  const hasPlaceholder = field.type !== 'boolean'

  const handleOptionAdd = () => {
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
    onUpdate({ options: newOptions })
  }

  const handleOptionRemove = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index) || []
    onUpdate({ options: newOptions })
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(field.options || [])]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

  const handleConditionalToggle = (enabled: boolean) => {
    if (enabled) {
      onUpdate({
        conditionalLogic: {
          fieldId: otherFields[0]?.id || '',
          operator: 'equals',
          value: '',
        },
      })
    } else {
      onUpdate({ conditionalLogic: undefined })
    }
  }

  const handleConditionalUpdate = (updates: Partial<NonNullable<Field['conditionalLogic']>>) => {
    if (field.conditionalLogic) {
      onUpdate({
        conditionalLogic: { ...field.conditionalLogic, ...updates },
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="field-label">Label</Label>
          <Input
            id="field-label"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Enter field label"
          />
        </div>

        {hasPlaceholder && (
          <div className="space-y-2">
            <Label htmlFor="field-placeholder">Placeholder</Label>
            <Input
              id="field-placeholder"
              value={field.placeholder || ''}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              placeholder="Enter placeholder text"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="field-required">Required</Label>
          <Switch
            id="field-required"
            checked={field.required}
            onCheckedChange={(checked) => onUpdate({ required: checked })}
          />
        </div>

        {hasOptions && (
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOptionRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleOptionAdd}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {hasValidation && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field-min">Min Value</Label>
              <Input
                id="field-min"
                type="number"
                value={field.validation?.find((v) => v.type === 'min')?.value as number ?? ''}
                onChange={(e) => {
                  const minRule = field.validation?.find((v) => v.type === 'min')
                  const newValue = e.target.value ? Number(e.target.value) : undefined
                  if (minRule) {
                    onUpdate({
                      validation: field.validation?.map((v) =>
                        v.type === 'min' ? { ...v, value: newValue } : v
                      ),
                    })
                  } else {
                    onUpdate({
                      validation: [
                        ...(field.validation || []),
                        { type: 'min', value: newValue, message: '' },
                      ],
                    })
                  }
                }}
                placeholder="Min"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field-max">Max Value</Label>
              <Input
                id="field-max"
                type="number"
                value={field.validation?.find((v) => v.type === 'max')?.value as number ?? ''}
                onChange={(e) => {
                  const maxRule = field.validation?.find((v) => v.type === 'max')
                  const newValue = e.target.value ? Number(e.target.value) : undefined
                  if (maxRule) {
                    onUpdate({
                      validation: field.validation?.map((v) =>
                        v.type === 'max' ? { ...v, value: newValue } : v
                      ),
                    })
                  } else {
                    onUpdate({
                      validation: [
                        ...(field.validation || []),
                        { type: 'max', value: newValue, message: '' },
                      ],
                    })
                  }
                }}
                placeholder="Max"
              />
            </div>
          </div>
        )}

        {(field.type === 'text' || field.type === 'email') && (
          <div className="space-y-2">
            <Label htmlFor="field-maxlength">Max Length</Label>
            <Input
              id="field-maxlength"
              type="number"
              value={field.validation?.find((v) => v.type === 'max')?.value as number ?? ''}
              onChange={(e) => {
                const maxRule = field.validation?.find((v) => v.type === 'max')
                const newValue = e.target.value ? Number(e.target.value) : undefined
                if (maxRule) {
                  onUpdate({
                    validation: field.validation?.map((v) =>
                      v.type === 'max' ? { ...v, value: newValue } : v
                    ),
                  })
                } else {
                  onUpdate({
                    validation: [
                      ...(field.validation || []),
                      { type: 'max', value: newValue, message: '' },
                    ],
                  })
                }
              }}
              placeholder="Max characters"
            />
          </div>
        )}
      </div>

      <Collapsible open={conditionalOpen} onOpenChange={setConditionalOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <span>Conditional Logic</span>
            {conditionalOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="conditional-enabled">Enable conditional logic</Label>
            <Switch
              id="conditional-enabled"
              checked={!!field.conditionalLogic}
              onCheckedChange={handleConditionalToggle}
            />
          </div>

          {field.conditionalLogic && otherFields.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Show this field when</Label>
                <Select
                  value={field.conditionalLogic.fieldId}
                  onValueChange={(value) => handleConditionalUpdate({ fieldId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {otherFields.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.label || 'Untitled field'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Operator</Label>
                <Select
                  value={field.conditionalLogic.operator}
                  onValueChange={(value) =>
                    handleConditionalUpdate({ operator: value as Field['conditionalLogic']['operator'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="not_equals">Not Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="is_empty">Is Empty</SelectItem>
                    <SelectItem value="is_not_empty">Is Not Empty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!['is_empty', 'is_not_empty'].includes(field.conditionalLogic.operator) && (
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    value={field.conditionalLogic.value || ''}
                    onChange={(e) => handleConditionalUpdate({ value: e.target.value })}
                    placeholder="Enter value"
                  />
                </div>
              )}
            </div>
          )}

          {field.conditionalLogic && otherFields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Add more fields to enable conditional logic.
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
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
    const type = event.active.data.current?.fieldType as FieldType | undefined
    if (type) {
      setActiveDragType(type)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null)
    
    const { active, over } = event
    
    if (!over) return

    const fieldType = active.data.current?.fieldType as FieldType | undefined
    
    if (fieldType) {
      const newField = createField(fieldType)
      setFields((prev) => [...prev, newField])
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
                <DraggableFieldType key={type} type={type} />
              ))}
            </div>
          </aside>

          <div className="flex-1 overflow-y-auto p-6">
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

              {fields.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <p className="text-muted-foreground">
                    Drag a field here to get started
                  </p>
                </div>
              ) : (
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {fields.map((field) => (
                      <SortableFieldCard
                        key={field.id}
                        field={field}
                        isSelected={selectedFieldId === field.id}
                        onSelect={() => setSelectedFieldId(field.id)}
                        onDelete={() => handleFieldDelete(field.id)}
                        onLabelChange={(label) => handleFieldUpdate(field.id, { label })}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>
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
