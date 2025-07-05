<?php
require_once '../core/database.php';
require_once '../core/config.php';

$database = new Database();
$db = $database->connect();

$query = "SELECT id, password FROM users";
$stmt = $db->prepare($query);
$stmt->execute();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $id = $row['id'];
    $password = $row['password'];

    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    // Update the user's password in the database
    $update_query = "UPDATE users SET password = :password WHERE id = :id";
    $update_stmt = $db->prepare($update_query);
    $update_stmt->bindParam(':password', $hashed_password);
    $update_stmt->bindParam(':id', $id);
    $update_stmt->execute();
}

echo "Password migration completed successfully.";
?>
