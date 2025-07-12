<?php
// Required headers
// Set CORS headers based on allowed origins
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
    $allowed_origins = unserialize(ALLOWED_ORIGINS);
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $origin);
    }
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../core/database.php';
require_once '../core/utils.php';
require_once '../core/config.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// Database connection
$database = new Database();
$db = $database->connect();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Token validation
function validate_token() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($authHeader)) {
        http_response_code(401);
        echo json_encode(array("message" => "Access denied. Authorization header not found."));
        exit();
    }

    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(array("message" => "Access denied. Invalid Authorization header format."));
        exit();
    }

    $jwt = $matches[1];

    try {
        $decoded = JWT::decode($jwt, new Key(JWT_SECRET, 'HS256'));
        return $decoded->data;
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(array("message" => "Access denied.", "error" => $e->getMessage()));
        exit();
    }
}

// Validate token
$decoded_data = validate_token();

// Validate required fields
if (empty($data->project_id) || empty($data->message)) {
    http_response_code(400);
    echo json_encode(array("message" => "Project ID and message are required."));
    exit();
}

try {
    // Insert message
    $sql = "INSERT INTO project_messages (project_id, sender_id, message, created_at) VALUES (:project_id, :sender_id, :message, NOW())";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':project_id', $data->project_id);
    $stmt->bindParam(':sender_id', $decoded_data->id);
    $stmt->bindParam(':message', $data->message);
    
    if ($stmt->execute()) {
        $message_id = $db->lastInsertId();
        
        // Fetch the created message with sender info
        $fetch_sql = "SELECT pm.*, u.name as sender_name, u.email as sender_email 
                      FROM project_messages pm 
                      JOIN users u ON pm.sender_id = u.id 
                      WHERE pm.id = :message_id";
        $fetch_stmt = $db->prepare($fetch_sql);
        $fetch_stmt->bindParam(':message_id', $message_id);
        $fetch_stmt->execute();
        
        $message = $fetch_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($message) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "Message created successfully.",
                "data" => $message
            ));
        } else {
            http_response_code(201);
            echo json_encode(array("message" => "Message created successfully."));
        }
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create message."));
    }
    
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(array("message" => "Unable to create message.", "error" => $e->getMessage()));
}
?>