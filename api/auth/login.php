<?php
// Allow localhost for development CORS
$allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'https://yourfrontenddomain.com'];
if(isset($_SERVER['HTTP_ORIGIN'])){
    header("Access-Control-Allow-Credentials: true");
    header("Vary: Origin"); // Required when allowing credentials
    header("Access-Control-Allow-Headers: Content-Type");
    if(in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    }
}
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';
require_once '../core/utils.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->connect();

file_put_contents('../logs/debug.log', "Login Script Start\n", FILE_APPEND);
$data = json_decode(file_get_contents("php://input"));
file_put_contents('../logs/debug.log', "Request Body: " . print_r($data, true) . "\n", FILE_APPEND);

if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(array("message" => "Email and password are required."));
    return;
}

$query = "SELECT id, name, email, password, role, company, rate FROM users WHERE email = :email LIMIT 0,1";

$stmt = $db->prepare($query);
$stmt->bindParam(':email', $data->email);

try {
    $stmt->execute();
} catch (PDOException $e) {
    file_put_contents('../logs/debug.log', "PDOException: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(array("message" => "Database error."));
    return;
}

$num = $stmt->rowCount();
file_put_contents('../logs/debug.log', "Row Count: " . $num . "\n", FILE_APPEND);

if ($num > 0) {
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    file_put_contents('../logs/debug.log', "User Data: " . print_r($row, true) . "\n", FILE_APPEND);
    $id = $row['id'];
    $name = $row['name'];
    $email = $row['email'];
    $password2 = $row['password'];
    $role = $row['role'];
    $company = $row['company'];
    $rate = $row['rate'];

    if (password_verify($data->password, $password2)) {
        // log_activity($db, $id, "User logged in");
        $issuer_claim = "YOUR_DOMAIN.com";
        $audience_claim = "THE_AUDIENCE";
        $issuedat_claim = time();
        $notbefore_claim = $issuedat_claim;
        $access_token_expire_seconds = 15 * 60;
        $expire_claim = $issuedat_claim + $access_token_expire_seconds;

        $token = array(
            "iss" => $issuer_claim,
            "aud" => $audience_claim,
            "iat" => $issuedat_claim,
            "nbf" => $notbefore_claim,
            "exp" => $expire_claim,
            "data" => array(
                "id" => $id,
                "name" => $name,
                "email" => $email,
                "role" => $role,
                "company" => $company,
                "rate" => $rate
            )
        );

        http_response_code(200);
        $access_token = JWT::encode($token, JWT_SECRET, 'HS256');

        // Generate Refresh Token
        $refresh_token_expiry_days = 7;
        $refresh_token_expiry_seconds = $refresh_token_expiry_days * 24 * 60 * 60;
        $refresh_token_value = bin2hex(random_bytes(32));
        $refresh_token_hash = hash('sha256', $refresh_token_value);
        $refresh_token_expires_at = date('Y-m-d H:i:s', $issuedat_claim + $refresh_token_expiry_seconds);

        // Store refresh token hash in database
        try {
            $invalidate_old_stmt = $db->prepare("UPDATE user_refresh_tokens SET revoked_at = NOW() WHERE user_id = :user_id AND revoked_at IS NULL");
            $invalidate_old_stmt->bindParam(':user_id', $id);
            $invalidate_old_stmt->execute();

            $store_refresh_stmt = $db->prepare("INSERT INTO user_refresh_tokens (user_id, token_hash, expires_at) VALUES (:user_id, :token_hash, :expires_at)");
            $store_refresh_stmt->bindParam(':user_id', $id);
            $store_refresh_stmt->bindParam(':token_hash', $refresh_token_hash);
            $store_refresh_stmt->bindParam(':expires_at', $refresh_token_expires_at);
            $store_refresh_stmt->execute();
        } catch (PDOException $e) {
            error_log("Failed to store refresh token for user ID {$id}: " . $e->getMessage());
        }

        // Set refresh token as secure HttpOnly cookie
        // Set secure=false for localhost, true for production
        $isLocalhost = in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['http://localhost:5173', 'http://localhost:5174']);
        $cookieParams = [
            'expires' => $issuedat_claim + $refresh_token_expiry_seconds,
            'path' => '/',
            'domain' => '', // Set your domain if needed
            'secure' => !$isLocalhost, // false for localhost, true for production
            'httponly' => true,
            'samesite' => 'Strict'
        ];
        setcookie('refresh_token', $refresh_token_value, $cookieParams);

        echo json_encode(
            array(
                "message" => "Login successful.",
                "access_token" => $access_token,
                "refresh_token" => $refresh_token_value,
                "email" => $email,
                "role" => $role,
                "expires_at" => $expire_claim
            )
        );
    } else {
    http_response_code(401);
    echo json_encode(array("message" => "Invalid credentials. Please check your email and password."));
    }
} else {
    http_response_code(404);
    echo json_encode(array("message" => "User not found. Please check your email address."));
}
?>
