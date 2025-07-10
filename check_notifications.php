<?php
try {
    $pdo = new PDO('sqlite:api/data/axis-java.db');
    
    echo "Checking notifications table...\n";
    $stmt = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='notifications'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
        echo "NOTIFICATIONS TABLE:\n" . $result['sql'] . "\n\n";
    } else {
        echo "notifications table not found!\n\n";
    }
    
    // Check if notifications table exists and show columns
    $stmt = $pdo->query("PRAGMA table_info(notifications)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($columns) {
        echo "NOTIFICATIONS TABLE COLUMNS:\n";
        foreach ($columns as $column) {
            echo "- " . $column['name'] . " (" . $column['type'] . ")\n";
        }
    }
    
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
?>
