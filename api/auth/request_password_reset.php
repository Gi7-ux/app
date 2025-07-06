<?php
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../core/database.php';
require_once '../core/config.php'; // For JWT_SECRET, if needed for other things, not directly here

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email)) {
    http_response_code(400);
    echo json_encode(array("message" => "Email address is required."));
    return;
}

$email = filter_var($data->email, FILTER_VALIDATE_EMAIL);
if (!$email) {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid email format."));
    return;
}

// Check if user exists
$user_query = "SELECT id FROM users WHERE email = :email LIMIT 1";
$user_stmt = $db->prepare($user_query);
$user_stmt->bindParam(':email', $email);
$user_stmt->execute();

$user_row = $user_stmt->fetch(PDO::FETCH_ASSOC);

if (!$user_row) {
    // Still return a generic message to prevent email enumeration
    http_response_code(200); // Or 404, but 200 is common practice here
    echo json_encode(array("message" => "If an account with that email exists, a password reset link has been sent."));
    return;
}

$user_id = $user_row['id'];

try {
    // Generate a secure token
    $token = bin2hex(random_bytes(32)); // 64-character hex token
    $token_hash = hash('sha256', $token); // Hash the token for storage

    // Set token expiry (e.g., 1 hour from now)
    $expires_at = date('Y-m-d H:i:s', time() + 3600);

    // Store the token hash in the database
    // Invalidate any existing, unused tokens for this user first
    $invalidate_stmt = $db->prepare("UPDATE password_resets SET used_at = NOW() WHERE user_id = :user_id AND used_at IS NULL");
    $invalidate_stmt->bindParam(':user_id', $user_id);
    $invalidate_stmt->execute();

    $insert_stmt = $db->prepare("INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (:user_id, :token_hash, :expires_at)");
    $insert_stmt->bindParam(':user_id', $user_id);
    $insert_stmt->bindParam(':token_hash', $token_hash);
    $insert_stmt->bindParam(':expires_at', $expires_at);

    if ($insert_stmt->execute()) {
        // Simulate sending email
        // In a real application, use a proper email library (PHPMailer, SendGrid, etc.)
        $reset_link = "http://localhost:5174/reset-password?token=" . $token; // Adjust URL for your frontend

        // For debugging/testing purposes, we can log the link or token
        error_log("Password reset requested for email: " . $email);
        error_log("Reset link: " . $reset_link); // DO NOT do this in production if real emails are sent.
        // For now, we can add it to the response for easy testing during development.
        // Remove this line for production if actual emails are configured.
        $dev_testing_response_message = "If an account with that email exists, a password reset link has been sent. DEV_MODE_LINK: " . $reset_link;


        http_response_code(200);
        // echo json_encode(array("message" => "If an account with that email exists, a password reset link has been sent."));
        echo json_encode(array("message" => $dev_testing_response_message, "token_for_dev_testing" => $token )); // Include token for easier testing
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Could not process password reset request. Database error."));
        error_log("Failed to insert password reset token for user_id: " . $user_id . " - " . print_r($insert_stmt->errorInfo(), true));
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "An error occurred while processing the request: " . $e->getMessage()));
    error_log("Password reset request error: " . $e->getMessage());
}

?>
