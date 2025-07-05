<?php
require_once __DIR__ . '/../core/database.php';

$database = new Database();
$db = $database->connect();

try {
    $query = "UPDATE users SET name = username WHERE name IS NULL";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $affected = $stmt->rowCount();
    echo "Successfully updated $affected user records\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}