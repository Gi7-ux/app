<?php
require_once 'core/database.php';

$database = new Database();
$db = $database->connect();

echo "=== Users table structure ===\n";
$stmt = $db->query('DESCRIBE users');
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['Field'] . ' - ' . $row['Type'] . "\n";
}

echo "\n=== Messages table structure ===\n";
$stmt = $db->query('DESCRIBE messages');
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['Field'] . ' - ' . $row['Type'] . "\n";
}

echo "\n=== Message_threads table structure ===\n";
$stmt = $db->query('DESCRIBE message_threads');
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo $row['Field'] . ' - ' . $row['Type'] . "\n";
}
?>
