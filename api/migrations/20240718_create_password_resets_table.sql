-- Migration to create the password_resets table
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL UNIQUE, -- Store the hash of the token for security
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `used_at` TIMESTAMP NULL DEFAULT NULL, -- Timestamp when the token was used
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add an index on user_id for faster lookups
ALTER TABLE `password_resets` ADD INDEX `idx_user_id` (`user_id`);
-- Add an index on token_hash for faster lookups
ALTER TABLE `password_resets` ADD INDEX `idx_token_hash` (`token_hash`);
