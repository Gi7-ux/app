<?php
require_once __DIR__ . '/../core/database.php';
require_once __DIR__ . '/../core/utils.php';

$database = new Database();
$db = $database->connect();

try {
    $db->beginTransaction();
    
    // Check if skills table exists
    if (!table_exists($db, 'skills')) {
        // Create skills table
        $create_skills = "CREATE TABLE IF NOT EXISTS `skills` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL UNIQUE,
            `category` VARCHAR(100) DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $db->exec($create_skills);
        echo "Created skills table\n";
    }
    
    // Check if user_skills table exists
    if (!table_exists($db, 'user_skills')) {
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
        echo "Created user_skills table\n";
    }
    
    // Add last_seen column to users if it doesn't exist
    if (!column_exists($db, 'users', 'last_seen')) {
        $add_last_seen = "ALTER TABLE `users` ADD COLUMN `last_seen` TIMESTAMP NULL DEFAULT NULL";
        $db->exec($add_last_seen);
        echo "Added last_seen column to users table\n";
    }
    
    $db->commit();
    echo "Migration completed successfully\n";
} catch (PDOException $e) {
    $db->rollBack();
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
