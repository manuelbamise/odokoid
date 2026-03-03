-- name: CreateForm :one
INSERT INTO forms (title, description, fields)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetForm :one
SELECT * FROM forms
WHERE id = $1;

-- name: ListForms :many
SELECT * FROM forms
ORDER BY created_at DESC;

-- name: UpdateForm :one
UPDATE forms
SET title = $1,
    description = $2,
    fields = $3,
    updated_at = NOW()
WHERE id = $4
RETURNING *;

-- name: DeleteForm :exec
DELETE FROM forms
WHERE id = $1;
