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
        return true;
    } catch (PDOException $e) {
        file_put_contents(__DIR__ . '/../logs/debug.log', "Migration error: " . $e->getMessage() . "\n", FILE_APPEND);
        return false;
    }
}

function fix_messaging_tables($db) {
    file_put_contents(__DIR__ . '/../logs/debug.log', "Fixing messaging tables structure: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
    
    try {
        // Check if message_threads table has 'type' column
        $type_check = "SHOW COLUMNS FROM `message_threads` LIKE 'type'";
        $type_stmt = $db->prepare($type_check);
        $type_stmt->execute();
        
        if ($type_stmt->rowCount() == 0) {
            // Add 'type' column to message_threads
            $add_type = "ALTER TABLE `message_threads` ADD COLUMN `type` VARCHAR(50) NOT NULL DEFAULT 'direct_message' COMMENT 'e.g., project_communication, client_admin, admin_broadcast, direct_message'";
            $db->exec($add_type);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Added 'type' column to message_threads table\n", FILE_APPEND);
        }
        
        // Check if messages table has 'text' column (it has 'content' instead)
        $text_check = "SHOW COLUMNS FROM `messages` LIKE 'text'";
        $text_stmt = $db->prepare($text_check);
        $text_stmt->execute();
        
        if ($text_stmt->rowCount() == 0) {
            // Check if 'content' column exists first
            $content_check = "SHOW COLUMNS FROM `messages` LIKE 'content'";
            $content_stmt = $db->prepare($content_check);
            $content_stmt->execute();
            
            if ($content_stmt->rowCount() > 0) {
                // Rename 'content' column to 'text'
                $rename_content = "ALTER TABLE `messages` CHANGE COLUMN `content` `text` TEXT";
                $db->exec($rename_content);
                file_put_contents(__DIR__ . '/../logs/debug.log', "Renamed 'content' column to 'text' in messages table\n", FILE_APPEND);
            } else {
                // Add 'text' column if neither exists
                $add_text = "ALTER TABLE `messages` ADD COLUMN `text` TEXT DEFAULT NULL";
                $db->exec($add_text);
                file_put_contents(__DIR__ . '/../logs/debug.log', "Added 'text' column to messages table\n", FILE_APPEND);
            }
        }
        
        // Check if messages table has 'file_id' column
        $file_id_check = "SHOW COLUMNS FROM `messages` LIKE 'file_id'";
        $file_id_stmt = $db->prepare($file_id_check);
        $file_id_stmt->execute();
        
        if ($file_id_stmt->rowCount() == 0) {
            $add_file_id = "ALTER TABLE `messages` ADD COLUMN `file_id` INT DEFAULT NULL COMMENT 'Reference to an uploaded file, if the message is a file share'";
            $db->exec($add_file_id);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Added 'file_id' column to messages table\n", FILE_APPEND);
        }
        
        // Check if message_thread_participants table has 'last_read_timestamp' column
        $last_read_check = "SHOW COLUMNS FROM `message_thread_participants` LIKE 'last_read_timestamp'";
        $last_read_stmt = $db->prepare($last_read_check);
        $last_read_stmt->execute();
        
        if ($last_read_stmt->rowCount() == 0) {
            $add_last_read = "ALTER TABLE `message_thread_participants` ADD COLUMN `last_read_timestamp` TIMESTAMP NULL DEFAULT NULL COMMENT 'To track when a user last read messages in this thread'";
            $db->exec($add_last_read);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Added 'last_read_timestamp' column to message_thread_participants table\n", FILE_APPEND);
        }
        
        // Ensure message_threads table has all required columns from schema
        $columns_to_add = [
            'subject' => "ALTER TABLE `message_threads` ADD COLUMN `subject` VARCHAR(255) DEFAULT NULL COMMENT 'Optional subject for the thread, useful for broadcasts or specific discussions'",
            'updated_at' => "ALTER TABLE `message_threads` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ];
        
        foreach ($columns_to_add as $column => $query) {
            $check_query = "SHOW COLUMNS FROM `message_threads` LIKE '$column'";
            $check_stmt = $db->prepare($check_query);
            $check_stmt->execute();
            
            if ($check_stmt->rowCount() == 0) {
                try {
                    $db->exec($query);
                    file_put_contents(__DIR__ . '/../logs/debug.log', "Added '$column' column to message_threads table\n", FILE_APPEND);
                } catch (PDOException $e) {
                    // Column might already exist, skip
                    file_put_contents(__DIR__ . '/../logs/debug.log', "Column '$column' already exists or error: " . $e->getMessage() . "\n", FILE_APPEND);
                }
            }
        }
        
        // Create messaging tables if they don't exist (fallback)
        create_messaging_tables_if_missing($db);
        
    } catch (PDOException $e) {
        file_put_contents(__DIR__ . '/../logs/debug.log', "Error fixing messaging tables: " . $e->getMessage() . "\n", FILE_APPEND);
    }
}

function create_messaging_tables_if_missing($db) {
    // Create message_threads table if missing
    $threads_check = "SHOW TABLES LIKE 'message_threads'";
    $threads_stmt = $db->prepare($threads_check);
    $threads_stmt->execute();
    
    if ($threads_stmt->rowCount() == 0) {
        $create_threads = "CREATE TABLE IF NOT EXISTS `message_threads` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `project_id` INT DEFAULT NULL,
            `type` VARCHAR(50) NOT NULL COMMENT 'e.g., project_communication, client_admin, admin_broadcast, direct_message',
            `subject` VARCHAR(255) DEFAULT NULL COMMENT 'Optional subject for the thread, useful for broadcasts or specific discussions',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4";
        $db->exec($create_threads);
        file_put_contents(__DIR__ . '/../logs/debug.log', "Created message_threads table\n", FILE_APPEND);
    }
    
    // Create message_thread_participants table if missing
    $participants_check = "SHOW TABLES LIKE 'message_thread_participants'";
    $participants_stmt = $db->prepare($participants_check);
    $participants_stmt->execute();
    
    if ($participants_stmt->rowCount() == 0) {
        $create_participants = "CREATE TABLE IF NOT EXISTS `message_thread_participants` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `thread_id` INT NOT NULL,
            `user_id` INT NOT NULL,
            `last_read_timestamp` TIMESTAMP NULL DEFAULT NULL COMMENT 'To track when a user last read messages in this thread',
            `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`thread_id`) REFERENCES `message_threads` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
            UNIQUE KEY `unique_participant` (`thread_id`, `user_id`)
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4";
        $db->exec($create_participants);
        file_put_contents(__DIR__ . '/../logs/debug.log', "Created message_thread_participants table\n", FILE_APPEND);
    }
    
    // Create messages table if missing
    $messages_check = "SHOW TABLES LIKE 'messages'";
    $messages_stmt = $db->prepare($messages_check);
    $messages_stmt->execute();
    
    if ($messages_stmt->rowCount() == 0) {
        $create_messages = "CREATE TABLE IF NOT EXISTS `messages` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `thread_id` INT NOT NULL,
            `sender_id` INT NOT NULL,
            `text` TEXT DEFAULT NULL,
            `file_id` INT DEFAULT NULL COMMENT 'Reference to an uploaded file, if the message is a file share',
            `status` VARCHAR(50) DEFAULT 'approved' COMMENT 'e.g., approved, pending, deleted',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`thread_id`) REFERENCES `message_threads` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
            FOREIGN KEY (`file_id`) REFERENCES `files` (`id`) ON DELETE SET NULL
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4";
        $db->exec($create_messages);
        file_put_contents(__DIR__ . '/../logs/debug.log', "Created messages table\n", FILE_APPEND);
    }
}


?>
