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
        
        // Check if applications table exists
        $applications_check = "SHOW TABLES LIKE 'applications'";
        $applications_stmt = $db->prepare($applications_check);
        $applications_stmt->execute();
        
        if ($applications_stmt->rowCount() == 0) {
            // Create applications table
            $create_applications = "CREATE TABLE IF NOT EXISTS `applications` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `project_id` INT NOT NULL,
                `freelancer_name` VARCHAR(255) NOT NULL,
                `freelancer_handle` VARCHAR(255) NOT NULL,
                `bid` DECIMAL(10, 2) DEFAULT NULL,
                `note` TEXT DEFAULT NULL,
                `status` VARCHAR(50) DEFAULT 'pending',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
            )";
            $db->exec($create_applications);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Created applications table\n", FILE_APPEND);
        }
        
        // Ensure projects table has deadline column (not due_date)
        $deadline_check = "SHOW COLUMNS FROM `projects` LIKE 'deadline'";
        $deadline_stmt = $db->prepare($deadline_check);
        $deadline_stmt->execute();
        
        if ($deadline_stmt->rowCount() == 0) {
            $add_deadline = "ALTER TABLE `projects` ADD COLUMN `deadline` DATE DEFAULT NULL";
            $db->exec($add_deadline);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Added deadline column to projects table\n", FILE_APPEND);
        }
        
        // Check if user_refresh_tokens table exists
        $refresh_tokens_check = "SHOW TABLES LIKE 'user_refresh_tokens'";
        $refresh_tokens_stmt = $db->prepare($refresh_tokens_check);
        $refresh_tokens_stmt->execute();
        
        if ($refresh_tokens_stmt->rowCount() == 0) {
            // Create user_refresh_tokens table
            $create_refresh_tokens = "CREATE TABLE IF NOT EXISTS `user_refresh_tokens` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_id` INT NOT NULL,
                `token_hash` VARCHAR(255) NOT NULL UNIQUE,
                `expires_at` TIMESTAMP NOT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `revoked_at` TIMESTAMP NULL DEFAULT NULL,
                FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
            )";
            $db->exec($create_refresh_tokens);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Created user_refresh_tokens table\n", FILE_APPEND);
        }
        
        // Check if password_resets table exists
        $password_resets_check = "SHOW TABLES LIKE 'password_resets'";
        $password_resets_stmt = $db->prepare($password_resets_check);
        $password_resets_stmt->execute();
        
        if ($password_resets_stmt->rowCount() == 0) {
            $create_password_resets = "CREATE TABLE IF NOT EXISTS `password_resets` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_id` INT NOT NULL,
                `token_hash` VARCHAR(255) NOT NULL UNIQUE,
                `expires_at` TIMESTAMP NOT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `used_at` TIMESTAMP NULL DEFAULT NULL,
                FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
            )";
            $db->exec($create_password_resets);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Created password_resets table\n", FILE_APPEND);
        }
        
        // Check if tasks table exists with correct structure
        $tasks_check = "SHOW TABLES LIKE 'tasks'";
        $tasks_stmt = $db->prepare($tasks_check);
        $tasks_stmt->execute();
        
        if ($tasks_stmt->rowCount() == 0) {
            // Create tasks table with correct structure
            $create_tasks = "CREATE TABLE IF NOT EXISTS `tasks` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `assignment_id` INT DEFAULT NULL,
                `project_id` INT NOT NULL,
                `description` VARCHAR(255) NOT NULL,
                `assigned_to` INT DEFAULT NULL,
                `status` VARCHAR(50) DEFAULT 'Pending',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE,
                FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
                FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL
            )";
            $db->exec($create_tasks);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Created tasks table\n", FILE_APPEND);
        } else {
            // Ensure tasks table has assignment_id column
            $assignment_id_check = "SHOW COLUMNS FROM `tasks` LIKE 'assignment_id'";
            $assignment_id_stmt = $db->prepare($assignment_id_check);
            $assignment_id_stmt->execute();
            
            if ($assignment_id_stmt->rowCount() == 0) {
                $add_assignment_id = "ALTER TABLE `tasks` ADD COLUMN `assignment_id` INT DEFAULT NULL";
                $db->exec($add_assignment_id);
                file_put_contents(__DIR__ . '/../logs/debug.log', "Added assignment_id column to tasks table\n", FILE_APPEND);
            }
            
            // Ensure tasks table has assigned_to column
            $assigned_to_check = "SHOW COLUMNS FROM `tasks` LIKE 'assigned_to'";
            $assigned_to_stmt = $db->prepare($assigned_to_check);
            $assigned_to_stmt->execute();
            
            if ($assigned_to_stmt->rowCount() == 0) {
                $add_assigned_to = "ALTER TABLE `tasks` ADD COLUMN `assigned_to` INT DEFAULT NULL";
                $db->exec($add_assigned_to);
                file_put_contents(__DIR__ . '/../logs/debug.log', "Added assigned_to column to tasks table\n", FILE_APPEND);
            }
        }
        
        // Ensure assignments table has title column
        $assignment_title_check = "SHOW COLUMNS FROM `assignments` LIKE 'title'";
        $assignment_title_stmt = $db->prepare($assignment_title_check);
        $assignment_title_stmt->execute();
        
        if ($assignment_title_stmt->rowCount() == 0) {
            $add_assignment_title = "ALTER TABLE `assignments` ADD COLUMN `title` VARCHAR(255) NOT NULL DEFAULT ''";
            $db->exec($add_assignment_title);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Added title column to assignments table\n", FILE_APPEND);
        }
        
        // Check if time_logs table exists
        $time_logs_check = "SHOW TABLES LIKE 'time_logs'";
        $time_logs_stmt = $db->prepare($time_logs_check);
        $time_logs_stmt->execute();
        
        if ($time_logs_stmt->rowCount() == 0) {
            $create_time_logs = "CREATE TABLE IF NOT EXISTS `time_logs` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_id` INT NOT NULL,
                `project_id` INT NOT NULL,
                `task_id` INT DEFAULT NULL,
                `hours` DECIMAL(5, 2) NOT NULL,
                `log_date` DATE NOT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
                FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
                FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE SET NULL
            )";
            $db->exec($create_time_logs);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Created time_logs table\n", FILE_APPEND);
        }
        
        // Check if notifications table exists  
        $notifications_check = "SHOW TABLES LIKE 'notifications'";
        $notifications_stmt = $db->prepare($notifications_check);
        $notifications_stmt->execute();
        
        if ($notifications_stmt->rowCount() == 0) {
            $create_notifications = "CREATE TABLE IF NOT EXISTS `notifications` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_id` INT NOT NULL,
                `message` TEXT NOT NULL,
                `link` VARCHAR(255) DEFAULT NULL,
                `is_read` BOOLEAN DEFAULT FALSE,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
            )";
            $db->exec($create_notifications);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Created notifications table\n", FILE_APPEND);
        }
        
        // Check if invoices table exists
        $invoices_check = "SHOW TABLES LIKE 'invoices'";
        $invoices_stmt = $db->prepare($invoices_check);
        $invoices_stmt->execute();
        
        if ($invoices_stmt->rowCount() == 0) {
            $create_invoices = "CREATE TABLE IF NOT EXISTS `invoices` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `project_id` INT NOT NULL,
                `client_id` INT NOT NULL,
                `freelancer_id` INT DEFAULT NULL,
                `invoice_number` VARCHAR(255) NOT NULL UNIQUE,
                `issue_date` DATE NOT NULL,
                `due_date` DATE NOT NULL,
                `total_amount` DECIMAL(10, 2) NOT NULL,
                `status` VARCHAR(50) DEFAULT 'draft',
                `notes` TEXT DEFAULT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE RESTRICT,
                FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
                FOREIGN KEY (`freelancer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
            )";
            $db->exec($create_invoices);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Created invoices table\n", FILE_APPEND);
        }
        
        // Check if payments table exists
        $payments_check = "SHOW TABLES LIKE 'payments'";
        $payments_stmt = $db->prepare($payments_check);
        $payments_stmt->execute();
        
        if ($payments_stmt->rowCount() == 0) {
            $create_payments = "CREATE TABLE IF NOT EXISTS `payments` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `invoice_id` INT DEFAULT NULL,
                `project_id` INT DEFAULT NULL,
                `paid_by_user_id` INT NOT NULL,
                `paid_to_user_id` INT DEFAULT NULL,
                `amount` DECIMAL(10, 2) NOT NULL,
                `payment_date` DATE NOT NULL,
                `payment_method` VARCHAR(100) DEFAULT NULL,
                `transaction_id` VARCHAR(255) DEFAULT NULL UNIQUE,
                `status` VARCHAR(50) DEFAULT 'completed',
                `notes` TEXT DEFAULT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL,
                FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
                FOREIGN KEY (`paid_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
                FOREIGN KEY (`paid_to_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
            )";
            $db->exec($create_payments);
            file_put_contents(__DIR__ . '/../logs/debug.log', "Created payments table\n", FILE_APPEND);
        }
        
        return true;
    } catch (PDOException $e) {
        file_put_contents(__DIR__ . '/../logs/debug.log', "Migration error: " . $e->getMessage() . "\n", FILE_APPEND);
        return false;
    }
}


?>
