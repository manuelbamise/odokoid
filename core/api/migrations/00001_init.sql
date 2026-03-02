-- Create a simple placeholder table for migrations test
CREATE TABLE IF NOT EXISTS schema_version_test (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a test record
INSERT INTO schema_version_test (version) VALUES ('init');
