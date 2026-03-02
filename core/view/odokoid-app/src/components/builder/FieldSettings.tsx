import { useState } from 'react'
import { Plus, X, ChevronDown, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
import type { Field } from '@/types/form'

interface FieldSettingsProps {
  field: Field
  allFields: Field[]
  onUpdate: (updates: Partial<Field>) => void
}

export function FieldSettings({ field, allFields, onUpdate }: FieldSettingsProps) {
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
