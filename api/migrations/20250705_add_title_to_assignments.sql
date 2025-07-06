-- Migration: Add title column to assignments table
ALTER TABLE assignments
ADD COLUMN title VARCHAR(255) NULL;

UPDATE assignments SET title = '' WHERE title IS NULL;

ALTER TABLE assignments
MODIFY COLUMN title VARCHAR(255) NOT NULL;
