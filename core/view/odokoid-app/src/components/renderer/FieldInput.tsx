import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { Field } from '@/types/form'

interface FieldInputProps {
  field: Field
  value: unknown
  onChange: (value: unknown) => void
  error: string | null
  onEnter: () => void
}

export function FieldInput({ field, value, onChange, error, onEnter }: FieldInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onEnter()
    }
  }

  if (field.type === 'select') {
    return (
      <RadioGroup
        value={String(value || '')}
        onValueChange={(val) => onChange(val)}
        className="space-y-3"
      >
        {field.options?.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={option} />
            <Label htmlFor={option} className="cursor-pointer text-base">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    )
  }

  if (field.type === 'multiselect') {
    const currentValues = Array.isArray(value) ? value : []
    return (
      <div className="space-y-3">
        {field.options?.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={option}
              checked={currentValues.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...currentValues, option])
                } else {
                  onChange(currentValues.filter((v: string) => v !== option))
                }
              }}
            />
            <Label htmlFor={option} className="cursor-pointer text-base">
              {option}
            </Label>
          </div>
        ))}
      </div>
    )
  }

  if (field.type === 'boolean') {
    const boolValue = value === true || value === 'true'
    return (
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`p-6 rounded-lg border-2 transition-all ${
            boolValue === true
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="text-2xl mb-2">✓</div>
          <div className="font-medium">Yes</div>
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`p-6 rounded-lg border-2 transition-all ${
            boolValue === false
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="text-2xl mb-2">✗</div>
          <div className="font-medium">No</div>
        </button>
      </div>
    )
  }

  if (field.type === 'number') {
    const minRule = field.validation?.find((v) => v.type === 'min')
    const maxRule = field.validation?.find((v) => v.type === 'max')
    return (
      <Input
        type="number"
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        onKeyDown={handleKeyDown}
        placeholder={field.placeholder}
        min={minRule?.value}
        max={maxRule?.value}
        className={error ? 'border-destructive' : ''}
      />
    )
  }

  if (field.type === 'date') {
    return (
      <Input
        type="date"
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value || undefined)}
        onKeyDown={handleKeyDown}
        className={error ? 'border-destructive' : ''}
      />
    )
  }

  return (
    <Input
      type={field.type === 'email' ? 'email' : 'text'}
      value={String(value || '')}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={field.placeholder}
      className={error ? 'border-destructive' : ''}
    />
  )
}
