<?php
require_once 'core/database.php';

$database = new Database();
$db = $database->connect();

if (!$db) {
    echo "Database connection failed\n";
    exit(1);
}

echo "Checking messaging tables...\n";

// Check if messaging tables exist
$tables = ['message_threads', 'message_thread_participants', 'messages'];
foreach ($tables as $table) {
    try {
        $stmt = $db->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "✅ Table '$table' exists\n";
            
            // Check table structure
            $struct_stmt = $db->query("DESCRIBE $table");
            echo "   Columns: ";
            while ($col = $struct_stmt->fetch(PDO::FETCH_ASSOC)) {
                echo $col['Field'] . " ";
            }
            echo "\n";
        } else {
            echo "❌ Table '$table' MISSING\n";
        }
    } catch (Exception $e) {
        echo "❌ Error checking table '$table': " . $e->getMessage() . "\n";
    }
}

// Check users table for name column
try {
    $stmt = $db->query("SHOW COLUMNS FROM users LIKE 'name'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Users table has 'name' column\n";
    } else {
        echo "❌ Users table MISSING 'name' column\n";
    }
} catch (Exception $e) {
    echo "❌ Error checking users table: " . $e->getMessage() . "\n";
}

// Show all tables
echo "\nAll tables in database:\n";
try {
    $stmt = $db->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        echo "- " . $row[0] . "\n";
    }
} catch (Exception $e) {
    echo "Error listing tables: " . $e->getMessage() . "\n";
}
?>
