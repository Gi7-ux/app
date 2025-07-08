<?php
require_once '../core/config.php';

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// Get the token from Authorization header
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
file_put_contents('../logs/debug.log', "Token Check - Authorization Header: {$authHeader}\n", FILE_APPEND);

if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(array("message" => "Invalid Authorization header format. Must be 'Bearer [token]'"));
    exit();
}
$jwt = $matches[1];

if (!$jwt) {
    http_response_code(401);
    echo json_encode(array("message" => "No token provided"));
    exit();
}

try {
    // Try to decode the JWT
    $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
    
    // If successful, log the token data and return success
    file_put_contents('../logs/debug.log', "Token Valid - Data: " . print_r($decoded, true) . "\n", FILE_APPEND);
    
    http_response_code(200);
    echo json_encode(array(
        "message" => "Token is valid",
        "expires" => $decoded->exp,
        "userId" => $decoded->data->id,
        "role" => $decoded->data->role,
        "timeRemaining" => ($decoded->exp - time()) . " seconds"
    ));
    
} catch (Exception $e) {
    // Log the error
    file_put_contents('../logs/debug.log', "Token Invalid - Error: " . $e->getMessage() . "\n", FILE_APPEND);
    
    http_response_code(401);
    echo json_encode(array(
        "message" => "Invalid token", 
        "error" => $e->getMessage(),
        "errorType" => get_class($e)
    ));
}
?>
