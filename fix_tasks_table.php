<?php
try {
    $pdo = new PDO('sqlite:api/data/axis-java.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Creating missing 'tasks' table...\n";
    
    // Check if tasks table exists
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'");
    if (!$stmt->fetch()) {
        $pdo->exec("
            CREATE TABLE tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                assignment_id INTEGER NOT NULL,
                description TEXT NOT NULL,
                assigned_to INTEGER,
                status VARCHAR(50) DEFAULT 'pending',
                priority VARCHAR(20) DEFAULT 'medium',
                due_date DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
                FOREIGN KEY (assigned_to) REFERENCES users(id)
            )
        ");
        echo "✓ Created 'tasks' table\n";
    } else {
        echo "- 'tasks' table already exists\n";
    }
    
    echo "\nDatabase schema updated successfully!\n";
    
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
?>
