<?php
require_once 'run_migrations.php';

echo "Running notifications migration...\n";
$result = run_critical_migrations();

if ($result) {
    echo "✓ Migration completed successfully\n";
} else {
    echo "✗ Migration failed\n";
}

echo "\nChecking notifications table structure...\n";

require_once '../core/database.php';
$database = new Database();
$db = $database->connect();

if ($db) {
    $stmt = $db->prepare("DESCRIBE notifications");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Notifications table columns:\n";
    foreach ($columns as $column) {
        echo "- " . $column['Field'] . " (" . $column['Type'] . ")\n";
    }
} else {
    echo "Database connection failed\n";
}
?>
