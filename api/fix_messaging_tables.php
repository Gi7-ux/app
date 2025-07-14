<?php
require_once 'core/database.php';

$database = new Database();
$db = $database->connect();

if (!$db) {
    echo "Database connection failed\n";
    exit(1);
}

echo "Fixing messaging tables structure...\n";

try {
    // Check if message_threads table has 'type' column
    $type_check = "SHOW COLUMNS FROM `message_threads` LIKE 'type'";
    $type_stmt = $db->prepare($type_check);
    $type_stmt->execute();
    
    if ($type_stmt->rowCount() == 0) {
        echo "Adding 'type' column to message_threads...\n";
        $add_type = "ALTER TABLE `message_threads` ADD COLUMN `type` VARCHAR(50) NOT NULL DEFAULT 'direct_message' COMMENT 'e.g., project_communication, client_admin, admin_broadcast, direct_message'";
        $db->exec($add_type);
        echo "✅ Added 'type' column to message_threads table\n";
    } else {
        echo "✅ 'type' column already exists in message_threads\n";
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
            echo "Renaming 'content' column to 'text' in messages...\n";
            $rename_content = "ALTER TABLE `messages` CHANGE COLUMN `content` `text` TEXT";
            $db->exec($rename_content);
            echo "✅ Renamed 'content' column to 'text' in messages table\n";
        } else {
            echo "Adding 'text' column to messages...\n";
            $add_text = "ALTER TABLE `messages` ADD COLUMN `text` TEXT DEFAULT NULL";
            $db->exec($add_text);
            echo "✅ Added 'text' column to messages table\n";
        }
    } else {
        echo "✅ 'text' column already exists in messages\n";
    }
    
    // Check if messages table has 'file_id' column
    $file_id_check = "SHOW COLUMNS FROM `messages` LIKE 'file_id'";
    $file_id_stmt = $db->prepare($file_id_check);
    $file_id_stmt->execute();
    
    if ($file_id_stmt->rowCount() == 0) {
        echo "Adding 'file_id' column to messages...\n";
        $add_file_id = "ALTER TABLE `messages` ADD COLUMN `file_id` INT DEFAULT NULL COMMENT 'Reference to an uploaded file, if the message is a file share'";
        $db->exec($add_file_id);
        echo "✅ Added 'file_id' column to messages table\n";
    } else {
        echo "✅ 'file_id' column already exists in messages\n";
    }
    
    // Check if message_thread_participants table has 'last_read_timestamp' column
    $last_read_check = "SHOW COLUMNS FROM `message_thread_participants` LIKE 'last_read_timestamp'";
    $last_read_stmt = $db->prepare($last_read_check);
    $last_read_stmt->execute();
    
    if ($last_read_stmt->rowCount() == 0) {
        echo "Adding 'last_read_timestamp' column to message_thread_participants...\n";
        $add_last_read = "ALTER TABLE `message_thread_participants` ADD COLUMN `last_read_timestamp` TIMESTAMP NULL DEFAULT NULL COMMENT 'To track when a user last read messages in this thread'";
        $db->exec($add_last_read);
        echo "✅ Added 'last_read_timestamp' column to message_thread_participants table\n";
    } else {
        echo "✅ 'last_read_timestamp' column already exists in message_thread_participants\n";
    }
    
    echo "\n✅ All messaging table fixes applied successfully!\n";
    
} catch (PDOException $e) {
    echo "❌ Error fixing messaging tables: " . $e->getMessage() . "\n";
}

// Test the fixes
echo "\nTesting API queries after fixes...\n";
try {
    $stmt = $db->query("SELECT type FROM message_threads LIMIT 1");
    echo "✅ 'type' column query works\n";
} catch (Exception $e) {
    echo "❌ 'type' column query failed: " . $e->getMessage() . "\n";
}

try {
    $stmt = $db->query("SELECT text FROM messages LIMIT 1");
    echo "✅ 'text' column query works\n";
} catch (Exception $e) {
    echo "❌ 'text' column query failed: " . $e->getMessage() . "\n";
}

try {
    $stmt = $db->query("SELECT file_id FROM messages LIMIT 1");
    echo "✅ 'file_id' column query works\n";
} catch (Exception $e) {
    echo "❌ 'file_id' column query failed: " . $e->getMessage() . "\n";
}
?>
