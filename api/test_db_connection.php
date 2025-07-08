<?php
require_once 'core/config.php';

echo "Testing database connection...\n";
echo "Host: " . DB_HOST . "\n";
echo "Database: " . DB_NAME . "\n";
echo "User: " . DB_USER . "\n";
echo "Password: " . (DB_PASS ? "[SET]" : "[NOT SET]") . "\n\n";

try {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME;
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful!\n";
    
    // Test a simple query
    $stmt = $pdo->query("SELECT 1 as test");
    $result = $stmt->fetch();
    echo "✅ Query test successful: " . $result['test'] . "\n";
    
    // Test users table
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "✅ Users table accessible: " . $result['count'] . " records\n";
    
} catch (PDOException $e) {
    echo "❌ Database connection failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
    
    // Provide some troubleshooting suggestions
    echo "\nTroubleshooting suggestions:\n";
    echo "1. Check if the database server is running\n";
    echo "2. Verify the hostname/IP address is correct\n";
    echo "3. Check if the database name exists\n";
    echo "4. Verify username and password are correct\n";
    echo "5. Check if remote connections are allowed\n";
    echo "6. Verify firewall settings allow MySQL connections\n";
}
?>
