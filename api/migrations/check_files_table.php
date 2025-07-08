<?php
require_once '../core/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    echo "=== Files Table Structure ===\n";
    $stmt = $db->prepare('DESCRIBE files');
    $stmt->execute();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- " . $row['Field'] . " (" . $row['Type'] . ")\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
