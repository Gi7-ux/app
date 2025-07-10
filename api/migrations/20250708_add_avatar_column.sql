-- Migration to add avatar column to users table if it doesn't exist
ALTER TABLE `users`
ADD COLUMN IF NOT EXISTS `avatar` VARCHAR(255) DEFAULT NULL COMMENT 'Path to user avatar image';

-- Also add skills column to store skills as JSON if it doesn't exist
ALTER TABLE `users`
ADD COLUMN IF NOT EXISTS `skills` JSON DEFAULT NULL COMMENT 'User skills stored as JSON array';