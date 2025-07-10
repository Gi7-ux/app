<?php
try {
    $pdo = new PDO('sqlite:api/data/axis-java.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Creating test notification for testing...\n";
    
    // Find a user to create notification for
    $stmt = $pdo->query("SELECT id FROM users LIMIT 1");
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        $user_id = $user['id'];
        echo "Found user ID: $user_id\n";
        
        // Insert a test notification
        $stmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, "Test Notification", "This is a test notification for debugging", "info"]);
        
        echo "✓ Test notification created successfully\n";
        
        // Check if notification was created
        $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$user_id]);
        $notification = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($notification) {
            echo "✓ Notification verified: " . $notification['title'] . "\n";
            echo "  - ID: " . $notification['id'] . "\n";
            echo "  - Message: " . $notification['message'] . "\n";
            echo "  - Is Read: " . ($notification['is_read'] ? 'Yes' : 'No') . "\n";
        }
        
    } else {
        echo "❌ No users found in database\n";
    }
    
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
?>
