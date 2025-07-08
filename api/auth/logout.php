<?php
require_once '../core/database.php';
require_once '../core/utils.php';

header('Content-Type: application/json');

// Invalidate the refresh token cookie
if (isset($_COOKIE['refresh_token'])) {
    $refreshToken = $_COOKIE['refresh_token'];

    $database = new Database();
    $pdo = $database->connect();

    // Mark the refresh token as revoked in the database
    $stmt = $pdo->prepare("UPDATE user_refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?");
    $stmt->execute([hash('sha256', $refreshToken)]);

    // Clear the refresh token cookie
    unset($_COOKIE['refresh_token']);
    setcookie('refresh_token', '', time() - 3600, '/', '', true, true); // Expire the cookie
}

// Always return a success response for logout
http_response_code(200);
echo json_encode(['message' => 'Logged out successfully']);
?>
