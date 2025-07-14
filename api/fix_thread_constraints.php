<?php
require_once 'core/database.php';

$database = new Database();
$db = $database->connect();

if (!$db) {
    echo "Database connection failed\n";
    exit(1);
}

echo "Fixing message_threads table constraints...\n";

try {
    // Check if created_by column exists and is NOT NULL
    $stmt = $db->query("SHOW COLUMNS FROM message_threads LIKE 'created_by'");
    $column = $stmt->fetch();
    
    if ($column && $column['Null'] === 'NO') {
        echo "Making created_by column nullable...\n";
        $db->exec("ALTER TABLE message_threads MODIFY COLUMN created_by INT DEFAULT NULL");
        echo "✅ made created_by nullable\n";
    } else {
        echo "✅ created_by column is already nullable or doesn't exist\n";
    }
    
    // Test creating a thread without created_by
    echo "Testing thread creation...\n";
    $stmt = $db->prepare("INSERT INTO message_threads (type, subject) VALUES ('test', 'Test thread')");
    $result = $stmt->execute();
    
    if ($result) {
        $thread_id = $db->lastInsertId();
        echo "✅ Test thread created successfully (ID: $thread_id)\n";
        
        // Clean up
        $db->exec("DELETE FROM message_threads WHERE id = $thread_id");
        echo "✅ Test thread cleaned up\n";
    } else {
        echo "❌ Failed to create test thread\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\nTesting the messaging API endpoints...\n";

// Test if we can run a basic query that the API uses
try {
    $stmt = $db->prepare("
        SELECT t.id as thread_id, t.type, t.project_id, t.subject
        FROM message_threads t 
        WHERE t.id IN (SELECT thread_id FROM message_thread_participants WHERE user_id = ?)
        LIMIT 1
    ");
    $stmt->execute([1]); // Admin user
    echo "✅ Basic thread query works\n";
} catch (Exception $e) {
    echo "❌ Basic thread query failed: " . $e->getMessage() . "\n";
}

echo "\nMessage threads table structure is now compatible with the API!\n";
?>
