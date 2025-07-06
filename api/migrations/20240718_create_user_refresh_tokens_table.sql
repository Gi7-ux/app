-- Migration to create the user_refresh_tokens table
CREATE TABLE IF NOT EXISTS `user_refresh_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL UNIQUE, -- Store the hash of the refresh token
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` TIMESTAMP NULL DEFAULT NULL, -- Timestamp when the token was revoked (e.g., due to rotation or logout)
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add an index on user_id for faster lookups
ALTER TABLE `user_refresh_tokens` ADD INDEX `idx_refresh_user_id` (`user_id`);
-- Add an index on token_hash for faster lookups
ALTER TABLE `user_refresh_tokens` ADD INDEX `idx_refresh_token_hash` (`token_hash`);
