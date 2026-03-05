-- +goose Up
ALTER TABLE forms ADD COLUMN user_id TEXT NOT NULL DEFAULT '';
CREATE INDEX idx_forms_user_id ON forms(user_id);

-- +goose Down
ALTER TABLE forms DROP COLUMN user_id;
