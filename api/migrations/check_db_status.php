<?php
require_once '../core/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    echo "Database connection successful!\n";
    
    // Check if applications table exists
    $apps_check = $db->prepare("SHOW TABLES LIKE 'applications'");
    $apps_check->execute();
    echo "Applications table exists: " . ($apps_check->rowCount() > 0 ? "YES" : "NO") . "\n";
    
    // Check if users table has name column
    $name_check = $db->prepare("SHOW COLUMNS FROM users LIKE 'name'");
    $name_check->execute();
    echo "Users table has 'name' column: " . ($name_check->rowCount() > 0 ? "YES" : "NO") . "\n";
    
    // List all tables
    $tables = $db->prepare("SHOW TABLES");
    $tables->execute();
    echo "\nAll tables in database:\n";
    while ($table = $tables->fetch(PDO::FETCH_NUM)) {
        echo "- " . $table[0] . "\n";
    }
    
    // Show users table structure
    echo "\nUsers table structure:\n";
    $cols = $db->prepare("DESCRIBE users");
    $cols->execute();
    while ($col = $cols->fetch(PDO::FETCH_ASSOC)) {
        echo "- " . $col['Field'] . " (" . $col['Type'] . ")\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
