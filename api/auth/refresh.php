<?php
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../core/database.php';
require_once '../core/config.php'; // For JWT_SECRET
require_once '../vendor/autoload.php'; // For JWT library

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->refresh_token)) {
    http_response_code(400);
    echo json_encode(array("message" => "Refresh token is required."));
    return;
}

$provided_refresh_token = $data->refresh_token;
$provided_refresh_token_hash = hash('sha256', $provided_refresh_token);

try {
    // Find the refresh token in the database
    $token_query = "SELECT id, user_id, expires_at, revoked_at FROM user_refresh_tokens WHERE token_hash = :token_hash LIMIT 1";
    $token_stmt = $db->prepare($token_query);
    $token_stmt->bindParam(':token_hash', $provided_refresh_token_hash);
    $token_stmt->execute();

    $token_row = $token_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$token_row) {
        http_response_code(401);
        echo json_encode(array("message" => "Invalid refresh token. Please log in again."));
        // Potential token misuse: if a token is not found, it might have been stolen and used already (if rotation is in place and old one deleted/revoked).
        // Consider logging this event or even invalidating all tokens for the user if this happens.
        return;
    }

    // Check if token is revoked
    if ($token_row['revoked_at'] !== null) {
        http_response_code(401);
        echo json_encode(array("message" => "Refresh token has been revoked. Please log in again."));
        // This indicates a used or explicitly revoked token.
        // If rotation is used, this could also mean a replay attempt of an old token.
        // CRITICAL: If a revoked token is replayed, invalidate all tokens for this user for security.
        $invalidate_all_stmt = $db->prepare("UPDATE user_refresh_tokens SET revoked_at = NOW() WHERE user_id = :user_id");
        $invalidate_all_stmt->bindParam(':user_id', $token_row['user_id']);
        $invalidate_all_stmt->execute();
        error_log("Attempt to use revoked refresh token for user_id: " . $token_row['user_id'] . ". All user tokens invalidated.");
        return;
    }

    // Check if token is expired
    $current_time = time();
    $expires_at_time = strtotime($token_row['expires_at']);
    if ($current_time > $expires_at_time) {
        http_response_code(401);
        echo json_encode(array("message" => "Refresh token has expired. Please log in again."));
        // Mark this specific token as revoked as well, as it's now expired.
        $revoke_expired_stmt = $db->prepare("UPDATE user_refresh_tokens SET revoked_at = NOW() WHERE id = :token_id");
        $revoke_expired_stmt->bindParam(':token_id', $token_row['id']);
        $revoke_expired_stmt->execute();
        return;
    }

    $user_id = $token_row['user_id'];
    $old_token_id = $token_row['id'];

    // Fetch user details for the new access token
    $user_details_query = "SELECT name, email, role, company, rate FROM users WHERE id = :user_id LIMIT 1";
    $user_details_stmt = $db->prepare($user_details_query);
    $user_details_stmt->bindParam(':user_id', $user_id);
    $user_details_stmt->execute();
    $user_details = $user_details_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user_details) {
        http_response_code(401); // Or 500, as this implies data inconsistency
        echo json_encode(array("message" => "User associated with token not found."));
        return;
    }

    // --- Issue a new Access Token ---
    $issuer_claim = "YOUR_DOMAIN.com";
    $audience_claim = "THE_AUDIENCE";
    $issuedat_claim = time();
    $notbefore_claim = $issuedat_claim;
    $access_token_expire_seconds = 15 * 60; // New Access Token: 15 minutes expiry
    $access_token_expire_claim = $issuedat_claim + $access_token_expire_seconds;

    $access_token_payload = array(
        "iss" => $issuer_claim,
        "aud" => $audience_claim,
        "iat" => $issuedat_claim,
        "nbf" => $notbefore_claim,
        "exp" => $access_token_expire_claim,
        "data" => array(
            "id" => $user_id,
            "name" => $user_details['name'],
            "email" => $user_details['email'],
            "role" => $user_details['role'],
            "company" => $user_details['company'],
            "rate" => $user_details['rate']
        )
    );
    $new_access_token = JWT::encode($access_token_payload, JWT_SECRET, 'HS256');

    // --- Refresh Token Rotation: Invalidate old, issue new ---
    $db->beginTransaction();

    // 1. Mark the old refresh token as revoked
    $revoke_stmt = $db->prepare("UPDATE user_refresh_tokens SET revoked_at = NOW() WHERE id = :token_id");
    $revoke_stmt->bindParam(':token_id', $old_token_id);
    $revoke_stmt->execute();

    // 2. Generate and store a new refresh token
    $new_refresh_token_expiry_days = 7;
    $new_refresh_token_expiry_seconds = $new_refresh_token_expiry_days * 24 * 60 * 60;
    $new_refresh_token_value = bin2hex(random_bytes(32));
    $new_refresh_token_hash = hash('sha256', $new_refresh_token_value);
    $new_refresh_token_expires_at = date('Y-m-d H:i:s', $issuedat_claim + $new_refresh_token_expiry_seconds);

    $store_new_refresh_stmt = $db->prepare("INSERT INTO user_refresh_tokens (user_id, token_hash, expires_at) VALUES (:user_id, :token_hash, :expires_at)");
    $store_new_refresh_stmt->bindParam(':user_id', $user_id);
    $store_new_refresh_stmt->bindParam(':token_hash', $new_refresh_token_hash);
    $store_new_refresh_stmt->bindParam(':expires_at', $new_refresh_token_expires_at);
    $store_new_refresh_stmt->execute();

    $db->commit();

    http_response_code(200);
    echo json_encode(array(
        "access_token" => $new_access_token,
        "refresh_token" => $new_refresh_token_value, // Send new plain refresh token
        "expires_at" => $access_token_expire_claim // Expiry of the new access token
    ));

} catch (PDOException $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log("Refresh token PDOException: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array("message" => "Database error during token refresh."));
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log("Refresh token Exception: " . $e->getMessage());
    http_response_code(500); // Or 401 if it's a JWT decoding specific error not caught earlier
    echo json_encode(array("message" => "An error occurred during token refresh."));
}
?>
