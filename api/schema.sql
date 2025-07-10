-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE `users`
ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `company` VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `rate` DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `avatar` VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `phone` VARCHAR(255) DEFAULT NULL;

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_id INT NOT NULL,
    budget DECIMAL(10, 2) DEFAULT NULL,
    deadline DATE DEFAULT NULL,
    freelancer_id INT DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users (id),
    FOREIGN KEY (freelancer_id) REFERENCES users (id)
);

-- ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Update TASKS table to add assignment_id if not exists
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS assignment_id INT DEFAULT NULL;

-- Add FK if not exists
ALTER TABLE tasks ADD CONSTRAINT IF NOT EXISTS fk_assignment_id FOREIGN KEY (assignment_id) REFERENCES assignments (id);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) DEFAULT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    link VARCHAR(255) DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- FILES TABLE (Assuming it exists, if not, define it here)
-- This is a placeholder, ensure the actual files table schema is present
CREATE TABLE IF NOT EXISTS `files` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` INT DEFAULT NULL,
    `uploader_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `size` INT NOT NULL COMMENT 'File size in bytes',
    `type` VARCHAR(100) NOT NULL COMMENT 'MIME type or file extension',
    `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- MESSAGES TABLE
-- Stores individual messages within a thread.
CREATE TABLE IF NOT EXISTS `messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `thread_id` INT NOT NULL,
    `sender_id` INT NOT NULL,
    `text` TEXT DEFAULT NULL,
    `file_id` INT DEFAULT NULL COMMENT 'Reference to an uploaded file, if the message is a file share',
    `status` VARCHAR(50) DEFAULT 'approved' COMMENT 'e.g., approved, pending, deleted',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`thread_id`) REFERENCES `message_threads` (`id`) ON DELETE CASCADE, -- If thread is deleted, messages are removed
    FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`file_id`) REFERENCES `files` (`id`) ON DELETE SET NULL -- If file is deleted, reference is removed
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- TICKETS TABLE
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- Stores values like GENERAL_INQUIRY, TECHNICAL_ISSUE, etc.
    priority ENUM ('Low', 'Medium', 'High') DEFAULT 'Medium',
    status ENUM ('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE -- If user is deleted, their tickets are also deleted
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- PROJECT MESSAGES TABLE (Legacy table for backward compatibility)
CREATE TABLE IF NOT EXISTS `project_messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` INT NOT NULL,
    `sender` VARCHAR(255) NOT NULL,
    `text` TEXT NOT NULL,
    `type` VARCHAR(50) DEFAULT 'project_communication',
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;