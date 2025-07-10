<?php
require_once '../core/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    echo "Database connection successful!\n";
    
    // Check if message_threads table exists
    $check = $db->prepare("SHOW TABLES LIKE 'message_threads'");
    $check->execute();
    echo "Message_threads table exists: " . ($check->rowCount() > 0 ? "YES" : "NO") . "\n";
    
    if ($check->rowCount() > 0) {
        // Show message_threads table structure
        echo "\nMessage_threads table structure:\n";
        $cols = $db->prepare("DESCRIBE message_threads");
        $cols->execute();
        while ($col = $cols->fetch(PDO::FETCH_ASSOC)) {
            echo "- " . $col['Field'] . " (" . $col['Type'] . ") " . 
                 ($col['Null'] == 'YES' ? 'NULL' : 'NOT NULL') . " " .
                 ($col['Default'] ? "DEFAULT '{$col['Default']}'" : '') . "\n";
        }
    }
    
    // List all tables to see what exists
    echo "\nAll tables in database:\n";
    $tables = $db->prepare("SHOW TABLES");
    $tables->execute();
    while ($table = $tables->fetch(PDO::FETCH_NUM)) {
        echo "- " . $table[0] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
