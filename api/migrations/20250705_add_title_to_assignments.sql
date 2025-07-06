-- Migration: Add title column to assignments table
ALTER TABLE assignments
ADD COLUMN title VARCHAR(255) NOT NULL;