package model

import "time"

type FieldType string

const (
	FieldTypeText        FieldType = "text"
	FieldTypeEmail       FieldType = "email"
	FieldTypeNumber      FieldType = "number"
	FieldTypeDate        FieldType = "date"
	FieldTypeSelect      FieldType = "select"
	FieldTypeMultiSelect FieldType = "multiselect"
	FieldTypeBoolean     FieldType = "boolean"
)

type ValidationRule struct {
	Type    string `json:"type"`
	Value   any    `json:"value,omitempty"`
	Message string `json:"message"`
}

type ConditionalRule struct {
	FieldID  string `json:"fieldId"`
	Operator string `json:"operator"`
	Value    string `json:"value,omitempty"`
}

type Field struct {
	ID               string           `json:"id"`
	Type             FieldType        `json:"type"`
	Label            string           `json:"label"`
	Placeholder      string           `json:"placeholder,omitempty"`
	Required         bool             `json:"required"`
	Validation       []ValidationRule `json:"validation,omitempty"`
	Options          []string         `json:"options,omitempty"`
	ConditionalLogic *ConditionalRule `json:"conditionalLogic,omitempty"`
}

type Form struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description,omitempty"`
	Fields      []Field   `json:"fields"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Submission struct {
	ID          string         `json:"id"`
	FormID      string         `json:"formId"`
	Responses   map[string]any `json:"responses"`
	SubmittedAt time.Time      `json:"submittedAt"`
}
