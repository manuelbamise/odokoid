-- name: UpsertUser :one
INSERT INTO users (id, email, updated_at)
VALUES ($1, $2, NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW()
RETURNING *;

-- name: GetUser :one
SELECT * FROM users WHERE id = $1;
