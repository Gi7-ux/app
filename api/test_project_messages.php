<?php
require_once 'core/database.php';

echo "Testing project_messages table...\n";

$database = new Database();
$db = $database->connect();

if (!$db) {
    echo "Database connection failed\n";
    exit(1);
}

try {
    // Check if project_messages table exists
    $stmt = $db->prepare("SHOW TABLES LIKE 'project_messages'");
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "✓ project_messages table exists\n";
        
        // Check if type column exists
        $stmt = $db->prepare("SHOW COLUMNS FROM project_messages LIKE 'type'");
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            echo "✓ type column exists in project_messages table\n";
        } else {
            echo "✗ type column MISSING in project_messages table\n";
        }
        
        // Show table structure
        echo "\nTable structure:\n";
        $stmt = $db->prepare("DESCRIBE project_messages");
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $column) {
            echo "- " . $column['Field'] . " (" . $column['Type'] . ")\n";
        }
    } else {
        echo "✗ project_messages table does NOT exist\n";
    }
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}
?>
