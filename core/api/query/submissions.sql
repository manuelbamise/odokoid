-- name: CreateSubmission :one
INSERT INTO submissions (form_id, responses)
VALUES ($1, $2)
RETURNING *;

-- name: ListSubmissionsByForm :many
SELECT * FROM submissions
WHERE form_id = $1
ORDER BY submitted_at DESC;

-- name: GetSubmission :one
SELECT * FROM submissions
WHERE id = $1;

-- name: CountSubmissionsByForm :one
SELECT COUNT(*) FROM submissions
WHERE form_id = $1;
