<?php
require_once 'core/database.php';
$db = (new Database())->connect();
$stmt = $db->query('SELECT id, name FROM users WHERE role = "admin" LIMIT 1');
$admin = $stmt->fetch();
echo 'Admin user: ' . $admin['id'] . ' - ' . $admin['name'] . PHP_EOL;
?>
