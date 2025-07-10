<?php
try {
    $pdo = new PDO('sqlite:api/data/axis-java.db');
    
    // Check assignments table
    $stmt = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='assignments'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
        echo "ASSIGNMENTS TABLE:\n" . $result['sql'] . "\n\n";
    } else {
        echo "assignments table not found\n\n";
    }
    
    // Check message_threads table
    $stmt = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='message_threads'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
        echo "MESSAGE_THREADS TABLE:\n" . $result['sql'] . "\n\n";
    } else {
        echo "message_threads table not found\n\n";
    }
    
    // Check files table
    $stmt = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='files'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
        echo "FILES TABLE:\n" . $result['sql'] . "\n\n";
    } else {
        echo "files table not found\n\n";
    }
    
    // List all tables
    echo "ALL TABLES:\n";
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- " . $row['name'] . "\n";
    }
    
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
?>
