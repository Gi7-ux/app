<?php
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../core/database.php';
require_once '../core/config.php'; // For password hashing consistency if needed, not directly here

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->token) || empty($data->new_password)) {
    http_response_code(400);
    echo json_encode(array("message" => "Token and new password are required."));
    return;
}

$token = $data->token;
$new_password = $data->new_password;

// Basic password strength check (example)
if (strlen($new_password) < 8) {
    http_response_code(400);
    echo json_encode(array("message" => "Password must be at least 8 characters long."));
    return;
}

try {
    // Hash the provided token to compare with the stored hash
    $token_hash = hash('sha256', $token);

    // Find the token in the database
    $reset_query = "SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash = :token_hash LIMIT 1";
    $reset_stmt = $db->prepare($reset_query);
    $reset_stmt->bindParam(':token_hash', $token_hash);
    $reset_stmt->execute();

    $reset_row = $reset_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$reset_row) {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid or expired password reset token."));
        return;
    }

    // Check if token is used
    if ($reset_row['used_at'] !== null) {
        http_response_code(400);
        echo json_encode(array("message" => "This password reset token has already been used."));
        return;
    }

    // Check if token is expired
    $current_time = time();
    $expires_at_time = strtotime($reset_row['expires_at']);

    if ($current_time > $expires_at_time) {
        http_response_code(400);
        echo json_encode(array("message" => "Password reset token has expired."));
        return;
    }

    $user_id = $reset_row['user_id'];
    $reset_id = $reset_row['id'];

    // Hash the new password
    $new_password_hashed = password_hash($new_password, PASSWORD_DEFAULT);

    // Update user's password
    $update_user_stmt = $db->prepare("UPDATE users SET password = :password WHERE id = :user_id");
    $update_user_stmt->bindParam(':password', $new_password_hashed);
    $update_user_stmt->bindParam(':user_id', $user_id);

    if ($update_user_stmt->execute()) {
        // Mark the token as used
        $mark_used_stmt = $db->prepare("UPDATE password_resets SET used_at = NOW() WHERE id = :reset_id");
        $mark_used_stmt->bindParam(':reset_id', $reset_id);
        $mark_used_stmt->execute();

        http_response_code(200);
        echo json_encode(array("message" => "Password has been reset successfully."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Could not update password. Database error."));
        error_log("Failed to update password for user_id: " . $user_id . " - " . print_r($update_user_stmt->errorInfo(), true));
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "An error occurred: " . $e->getMessage()));
    error_log("Password reset error: " . $e->getMessage());
}

?>
