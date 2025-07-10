<?php
// Test script to verify project messages functionality
require_once 'core/database.php';

echo "Testing project messages database setup...\n";

$database = new Database();
$db = $database->connect();

if (!$db) {
    echo "✗ Database connection failed\n";
    exit(1);
}

try {
    // Test if we can query the project_messages table without errors
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM project_messages WHERE type = 'project_communication'");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "✓ Successfully queried project_messages table with type column\n";
    echo "✓ Current message count: " . $result['count'] . "\n";
    
    // Test if we can insert a test message
    $test_stmt = $db->prepare("INSERT INTO project_messages (project_id, sender, text, type) VALUES (1, 'test_user', 'Test message', 'project_communication')");
    $test_stmt->execute();
    
    echo "✓ Successfully inserted test message\n";
    
    // Clean up the test message
    $cleanup_stmt = $db->prepare("DELETE FROM project_messages WHERE sender = 'test_user' AND text = 'Test message'");
    $cleanup_stmt->execute();
    
    echo "✓ Test completed successfully - project messages setup is working!\n";
    
} catch (PDOException $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
