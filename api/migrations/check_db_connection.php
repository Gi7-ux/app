<?php
// First try development config
if (file_exists(__DIR__ . '/../core/config.dev.php')) {
    require_once __DIR__ . '/../core/config.dev.php';
} else {
    require_once __DIR__ . '/../core/config.php';
}

echo "Trying to connect to database at: " . DB_HOST . "\n";
echo "Using database: " . DB_NAME . "\n";
echo "Using username: " . DB_USER . "\n";

try {
    $conn = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected successfully to the database!\n";
    
    // Check if the users table exists
    $stmt = $conn->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "Users table exists.\n";
        
        // Check users table structure
        $stmt = $conn->query("DESCRIBE users");
        echo "Users table structure:\n";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "- " . $row['Field'] . " (" . $row['Type'] . ")\n";
        }
    } else {
        echo "Users table does not exist.\n";
    }
    
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
?>
