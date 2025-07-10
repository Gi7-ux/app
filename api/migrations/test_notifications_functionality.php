<?php
// Test the notifications endpoint functionality
require_once '../core/database.php';

echo "Testing notifications table query...\n";

$database = new Database();
$db = $database->connect();

if (!$db) {
    echo "✗ Database connection failed\n";
    exit(1);
}

try {
    // Test the exact query from get.php
    $query = "SELECT id, title, message, type, is_read, created_at FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 10";
    $stmt = $db->prepare($query);
    $user_id = 1; // Test user ID
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "✓ Successfully queried notifications table with title and type columns\n";
    echo "✓ Found " . count($notifications) . " notifications\n";
    
    // Test inserting a notification
    $insert_query = "INSERT INTO notifications (user_id, title, message, type) VALUES (:user_id, :title, :message, :type)";
    $insert_stmt = $db->prepare($insert_query);
    $insert_stmt->bindParam(':user_id', $user_id);
    $title = 'Test Notification';
    $message = 'This is a test notification';
    $type = 'info';
    $insert_stmt->bindParam(':title', $title);
    $insert_stmt->bindParam(':message', $message);
    $insert_stmt->bindParam(':type', $type);
    $insert_stmt->execute();
    
    echo "✓ Successfully inserted test notification\n";
    
    // Clean up
    $delete_stmt = $db->prepare("DELETE FROM notifications WHERE title = 'Test Notification' AND message = 'This is a test notification'");
    $delete_stmt->execute();
    
    echo "✓ Test completed successfully - notifications functionality is working!\n";
    
} catch (PDOException $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
