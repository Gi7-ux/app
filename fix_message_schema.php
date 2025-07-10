<?php
try {
    $pdo = new PDO('sqlite:api/data/axis-java.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Adding missing columns to message_threads table...\n";
    
    // Add type column
    try {
        $pdo->exec("ALTER TABLE message_threads ADD COLUMN type VARCHAR(50) DEFAULT 'general'");
        echo "✓ Added 'type' column\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'duplicate column name') !== false) {
            echo "- 'type' column already exists\n";
        } else {
            throw $e;
        }
    }
    
    // Add subject column
    try {
        $pdo->exec("ALTER TABLE message_threads ADD COLUMN subject VARCHAR(255)");
        echo "✓ Added 'subject' column\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'duplicate column name') !== false) {
            echo "- 'subject' column already exists\n";
        } else {
            throw $e;
        }
    }
    
    // Check if message_thread_participants table exists
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='message_thread_participants'");
    if (!$stmt->fetch()) {
        echo "Creating message_thread_participants table...\n";
        $pdo->exec("
            CREATE TABLE message_thread_participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                thread_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(thread_id, user_id)
            )
        ");
        echo "✓ Created message_thread_participants table\n";
    } else {
        echo "- message_thread_participants table already exists\n";
    }
    
    echo "\nDatabase schema updated successfully!\n";
    
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
?>
