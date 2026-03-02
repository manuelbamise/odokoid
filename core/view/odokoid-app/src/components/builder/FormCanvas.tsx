import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Field, FieldType } from '@/types/form'
import { fieldTypeIcons, fieldTypeLabels } from './FieldPalette'

interface FieldCardProps {
  field: Field
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onLabelChange: (label: string) => void
}

export function FieldCard({ field, isSelected, onSelect, onDelete, onLabelChange }: FieldCardProps) {
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

interface FormCanvasProps {
  fields: Field[]
  selectedFieldId: string | null
  onSelectField: (id: string) => void
  onDeleteField: (id: string) => void
  onUpdateField: (id: string, updates: Partial<Field>) => void
}

export function FormCanvas({
  fields,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onUpdateField,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 overflow-y-auto p-6 transition-colors ${
        isOver ? 'bg-primary/5' : ''
      }`}
    >
      <div className="max-w-2xl mx-auto">
        {fields.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isOver ? 'border-primary bg-primary/5' : ''
            }`}
          >
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
                <FieldCard
                  key={field.id}
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => onSelectField(field.id)}
                  onDelete={() => onDeleteField(field.id)}
                  onLabelChange={(label) => onUpdateField(field.id, { label })}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  )
}
