<?php
require_once __DIR__ . '/../core/database.php';

// This file runs key migrations to ensure database schema is up to date
// It's designed to be included in key API endpoints that might need these fixes

function run_critical_migrations() {
    // Log that migration check is running
    file_put_contents(__DIR__ . '/../logs/debug.log', "Running critical migration checks: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
    
    $database = new Database();
    $db = $database->connect();
    
    if (!$db) {
        file_put_contents(__DIR__ . '/../logs/debug.log', "Migration error: Database connection failed\n", FILE_APPEND);
        return false;
    }
    
    try {
        $db->beginTransaction();
        
        // Check if users table has the name column
        $check_query = "SHOW COLUMNS FROM `users` LIKE 'name'";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() == 0) {
            // The name column doesn't exist, so add it
            $add_column_query = "ALTER TABLE `users` ADD COLUMN `name` VARCHAR(255) DEFAULT NULL";
            $db->exec($add_column_query);
            
            // Now update the name field with values from username
            $update_query = "UPDATE users SET name = username WHERE name IS NULL";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->execute();
            
            file_put_contents(__DIR__ . '/../logs/debug.log', "Added 'name' column to users table and updated values\n", FILE_APPEND);
        }
        
        // Check if skills table exists
        $skills_check = "SHOW TABLES LIKE 'skills'";
        $skills_stmt = $db->prepare($skills_check);
        $skills_stmt->execute();
        
        if ($skills_stmt->rowCount() == 0) {
            // Create skills table
            $create_skills = "CREATE TABLE IF NOT EXISTS `skills` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `name` VARCHAR(100) NOT NULL UNIQUE,
                `category` VARCHAR(100) DEFAULT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )";
            $db->exec($create_skills);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Created skills table\n", FILE_APPEND);
        }
        
        // Check if user_skills table exists
        $user_skills_check = "SHOW TABLES LIKE 'user_skills'";
        $user_skills_stmt = $db->prepare($user_skills_check);
        $user_skills_stmt->execute();
        
        if ($user_skills_stmt->rowCount() == 0) {
            // Create user_skills table
            $create_user_skills = "CREATE TABLE IF NOT EXISTS `user_skills` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_id` INT NOT NULL,
                `skill_id` INT NOT NULL,
                `proficiency` INT DEFAULT 1 COMMENT '1-5 scale where 5 is highest',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY `unique_user_skill` (`user_id`, `skill_id`),
                FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
            )";
            $db->exec($create_user_skills);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Created user_skills table\n", FILE_APPEND);
        }
        
        // Add last_seen column to users if it doesn't exist
        $last_seen_check = "SHOW COLUMNS FROM `users` LIKE 'last_seen'";
        $last_seen_stmt = $db->prepare($last_seen_check);
        $last_seen_stmt->execute();
        
        if ($last_seen_stmt->rowCount() == 0) {
            $add_last_seen = "ALTER TABLE `users` ADD COLUMN `last_seen` TIMESTAMP NULL DEFAULT NULL";
            $db->exec($add_last_seen);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Added last_seen column to users table\n", FILE_APPEND);
        }
        
        // Check if tickets table exists
        $tickets_check = "SHOW TABLES LIKE 'tickets'";
        $tickets_stmt = $db->prepare($tickets_check);
        $tickets_stmt->execute();

        if ($tickets_stmt->rowCount() == 0) {
            // Create tickets table
            $create_tickets = "CREATE TABLE IF NOT EXISTS `tickets` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_id` INT NOT NULL,
                `title` VARCHAR(255) NOT NULL,
                `description` TEXT NOT NULL,
                `category` VARCHAR(100) NOT NULL,
                `priority` ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
                `status` ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
            $db->exec($create_tickets);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Created tickets table\n", FILE_APPEND);
        }

        // Check if project_messages table exists (legacy table for project communication)
        $project_messages_check = "SHOW TABLES LIKE 'project_messages'";
        $project_messages_stmt = $db->prepare($project_messages_check);
        $project_messages_stmt->execute();

        if ($project_messages_stmt->rowCount() == 0) {
            // Create project_messages table for backward compatibility
            $create_project_messages = "CREATE TABLE IF NOT EXISTS `project_messages` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `project_id` INT NOT NULL,
                `sender` VARCHAR(255) NOT NULL,
                `text` TEXT NOT NULL,
                `type` VARCHAR(50) DEFAULT 'project_communication',
                `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
            $db->exec($create_project_messages);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Created project_messages table\n", FILE_APPEND);
        }

        // Check if the project_messages table has the type column
        $project_messages_type_check = "SHOW COLUMNS FROM `project_messages` LIKE 'type'";
        $project_messages_type_stmt = $db->prepare($project_messages_type_check);
        $project_messages_type_stmt->execute();

        if ($project_messages_type_stmt->rowCount() == 0) {
            // Add type column to project_messages table
            $add_type_column = "ALTER TABLE `project_messages` ADD COLUMN `type` VARCHAR(50) DEFAULT 'project_communication'";
            $db->exec($add_type_column);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Added type column to project_messages table\n", FILE_APPEND);
        }

        // Check if notifications table exists
        $notifications_check = "SHOW TABLES LIKE 'notifications'";
        $notifications_stmt = $db->prepare($notifications_check);
        $notifications_stmt->execute();

        if ($notifications_stmt->rowCount() == 0) {
            // Create notifications table
            $create_notifications = "CREATE TABLE IF NOT EXISTS `notifications` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_id` INT NOT NULL,
                `title` VARCHAR(255) DEFAULT NULL,
                `message` TEXT NOT NULL,
                `type` VARCHAR(50) DEFAULT 'general',
                `link` VARCHAR(255) DEFAULT NULL,
                `is_read` BOOLEAN DEFAULT FALSE,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
            $db->exec($create_notifications);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Created notifications table\n", FILE_APPEND);
        }

        // Check if notifications table has title column
        $notifications_title_check = "SHOW COLUMNS FROM `notifications` LIKE 'title'";
        $notifications_title_stmt = $db->prepare($notifications_title_check);
        $notifications_title_stmt->execute();

        if ($notifications_title_stmt->rowCount() == 0) {
            // Add title column to notifications table
            $add_title_column = "ALTER TABLE `notifications` ADD COLUMN `title` VARCHAR(255) DEFAULT NULL AFTER `user_id`";
            $db->exec($add_title_column);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Added title column to notifications table\n", FILE_APPEND);
        }

        // Check if notifications table has type column
        $notifications_type_check = "SHOW COLUMNS FROM `notifications` LIKE 'type'";
        $notifications_type_stmt = $db->prepare($notifications_type_check);
        $notifications_type_stmt->execute();

        if ($notifications_type_stmt->rowCount() == 0) {
            // Add type column to notifications table
            $add_type_column_notifications = "ALTER TABLE `notifications` ADD COLUMN `type` VARCHAR(50) DEFAULT 'general' AFTER `message`";
            $db->exec($add_type_column_notifications);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Added type column to notifications table\n", FILE_APPEND);
        }

        $db->commit();
        return true;
    } catch (PDOException $e) {
        file_put_contents(__DIR__ . '/../logs/debug.log', "Migration error: " . $e->getMessage() . "\n", FILE_APPEND);
        return false;
    }
}


?>
