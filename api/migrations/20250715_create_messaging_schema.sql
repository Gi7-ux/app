-- MESSAGE THREADS TABLE
-- Stores information about a conversation thread.
CREATE TABLE IF NOT EXISTS `message_threads` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` INT DEFAULT NULL,
    `type` VARCHAR(50) NOT NULL COMMENT 'e.g., project_communication, client_admin, admin_broadcast, direct_message',
    `subject` VARCHAR(255) DEFAULT NULL COMMENT 'Optional subject for the thread, useful for broadcasts or specific discussions',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL -- If project is deleted, thread might remain but unlinked or handled by app logic
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MESSAGE THREAD PARTICIPANTS TABLE
-- Links users to message threads.
CREATE TABLE IF NOT EXISTS `message_thread_participants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `thread_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `last_read_timestamp` TIMESTAMP NULL DEFAULT NULL COMMENT 'To track when a user last read messages in this thread',
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`thread_id`) REFERENCES `message_threads` (`id`) ON DELETE CASCADE, -- If thread is deleted, participant entries are removed
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE, -- If user is deleted, participant entries are removed
    UNIQUE KEY `unique_participant` (`thread_id`, `user_id`) -- A user can only be a participant in a thread once
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MESSAGES TABLE
-- Stores individual messages within a thread.
-- (Assuming this table might exist but needs structure confirmation/update from schema.sql or prior migrations)
-- This definition ensures all required fields are present.
CREATE TABLE IF NOT EXISTS `messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `thread_id` INT NOT NULL,
    `sender_id` INT NOT NULL,
    `text` TEXT DEFAULT NULL,
    `file_id` INT DEFAULT NULL COMMENT 'Reference to an uploaded file, if the message is a file share',
    `status` VARCHAR(50) DEFAULT 'approved' COMMENT 'e.g., approved, pending, deleted',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`thread_id`) REFERENCES `message_threads` (`id`) ON DELETE CASCADE, -- If thread is deleted, messages are removed
    FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE, -- If sender is deleted, messages might remain or be anonymized by app logic
    FOREIGN KEY (`file_id`) REFERENCES `files` (`id`) ON DELETE SET NULL -- If file is deleted, reference is removed
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- FILES TABLE (Ensure it's compatible, adding message_id if a file can belong to a single message directly)
-- The plan was to have files primarily project-based, and messages can reference a file via messages.file_id.
-- If a single file upload is itself a message, this structure is fine.
-- No changes to 'files' table structure in this step, just ensuring its compatibility with messages.file_id.

-- Add missing columns to existing tables if necessary (example, if 'files' table was very basic)
-- ALTER TABLE `files`
-- ADD COLUMN IF NOT EXISTS `description` TEXT DEFAULT NULL AFTER `name`,
-- ADD COLUMN IF NOT EXISTS `thumbnail_url` VARCHAR(255) DEFAULT NULL AFTER `path`;

-- Note: The `projects` and `users` tables are assumed to exist as per the original `api/schema.sql`.
-- The `files` table is also assumed to exist. This script focuses on the core messaging tables.

-- Consider adding an 'initiator_id' to message_threads if it's useful to know who started a client_admin or direct_message thread.
-- For now, the 'type' and participant roles should cover most scenarios.

-- Update the existing schema.sql to include these definitions or ensure it's run after the main schema.
-- For now, this is a separate migration script.
-- Make sure to update the main schema.sql or add this to the migration process.
-- For the purpose of this task, I will update api/schema.sql directly.
