<?php
require_once 'core/database.php';

$database = new Database();
$db = $database->connect();

if (!$db) {
    echo "Database connection failed\n";
    exit(1);
}

echo "Detailed structure of messaging tables...\n\n";

// Check message_threads table structure
echo "=== message_threads table ===\n";
try {
    $stmt = $db->query("DESCRIBE message_threads");
    while ($col = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("%-20s %-15s %-10s %-10s %-10s %s\n", 
            $col['Field'], $col['Type'], $col['Null'], 
            $col['Key'], $col['Default'], $col['Extra']);
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== message_thread_participants table ===\n";
try {
    $stmt = $db->query("DESCRIBE message_thread_participants");
    while ($col = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("%-20s %-15s %-10s %-10s %-10s %s\n", 
            $col['Field'], $col['Type'], $col['Null'], 
            $col['Key'], $col['Default'], $col['Extra']);
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== messages table ===\n";
try {
    $stmt = $db->query("DESCRIBE messages");
    while ($col = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("%-20s %-15s %-10s %-10s %-10s %s\n", 
            $col['Field'], $col['Type'], $col['Null'], 
            $col['Key'], $col['Default'], $col['Extra']);
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Test a simple query that the API might use
echo "\n=== Testing API queries ===\n";
try {
    // Test query from get_threads.php
    $test_query = "SELECT 
        t.id as thread_id, 
        t.subject, 
        t.project_id
      FROM 
        message_threads t
      LIMIT 1";
    $stmt = $db->query($test_query);
    echo "✅ Basic thread query works\n";
} catch (Exception $e) {
    echo "❌ Basic thread query failed: " . $e->getMessage() . "\n";
}

try {
    // Test if 'type' column exists
    $stmt = $db->query("SELECT type FROM message_threads LIMIT 1");
    echo "✅ 'type' column exists in message_threads\n";
} catch (Exception $e) {
    echo "❌ 'type' column missing in message_threads: " . $e->getMessage() . "\n";
}

try {
    // Test if 'text' column exists in messages
    $stmt = $db->query("SELECT text FROM messages LIMIT 1");
    echo "✅ 'text' column exists in messages\n";
} catch (Exception $e) {
    echo "❌ 'text' column missing in messages: " . $e->getMessage() . "\n";
}
?>
