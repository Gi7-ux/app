<?php
require_once 'core/database.php';

$database = new Database();
$db = $database->connect();

if ($db) {
    echo "Checking projects table structure...\n\n";
    
    $stmt = $db->query("DESCRIBE projects");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Columns in projects table:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']}) {$column['Null']} {$column['Key']}\n";
    }
    
    echo "\nSample data:\n";
    $stmt = $db->query("SELECT * FROM projects LIMIT 1");
    $sample = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($sample) {
        foreach ($sample as $key => $value) {
            echo "- $key: $value\n";
        }
    }
} else {
    echo "Failed to connect to database\n";
}
?>
