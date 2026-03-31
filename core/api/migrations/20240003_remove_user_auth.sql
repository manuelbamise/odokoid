-- +goose Up
ALTER TABLE forms DROP COLUMN IF EXISTS user_id;
DROP INDEX IF EXISTS idx_forms_user_id;
DROP TABLE IF EXISTS users;

-- +goose Down
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE forms ADD COLUMN user_id TEXT NOT NULL DEFAULT '';
CREATE INDEX idx_forms_user_id ON forms(user_id);
