<?php
try {
    $pdo = new PDO('sqlite:api/data/axis-java.db');
    
    echo "Tables with 'task' in name:\n";
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%task%'");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- " . $row['name'] . "\n";
    }
    
    echo "\nChecking if 'tasks' table exists:\n";
    $stmt = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='tasks'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
        echo "TASKS TABLE:\n" . $result['sql'] . "\n";
    } else {
        echo "No 'tasks' table found!\n";
    }
    
    echo "\nTIME_LOGS TABLE:\n";
    $stmt = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='time_logs'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
        echo $result['sql'] . "\n";
    }
    
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
?>
