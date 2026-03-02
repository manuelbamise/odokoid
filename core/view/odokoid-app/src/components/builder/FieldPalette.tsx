import { useDraggable } from '@dnd-kit/core'
import type { FieldType } from '@/types/form'
import {
  Type,
  Mail,
  Hash,
  Calendar,
  List,
  CheckSquare,
  ToggleLeft,
} from 'lucide-react'

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

interface FieldPaletteItemProps {
  type: FieldType
}

export function FieldPaletteItem({ type }: FieldPaletteItemProps) {
  const Icon = fieldTypeIcons[type]
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: {
      fieldType: type,
      source: 'palette',
    },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-card border rounded-lg cursor-grab hover:bg-accent hover:shadow-sm transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{fieldTypeLabels[type]}</span>
    </div>
  )
}

export const fieldTypes: FieldType[] = [
  'text',
  'email',
  'number',
  'date',
  'select',
  'multiselect',
  'boolean',
]

export { fieldTypeIcons, fieldTypeLabels }
