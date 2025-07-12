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
if (empty($data->id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Task ID is required."));
    exit();
}

try {
    // Build dynamic SQL update query
    $query_parts = [];
    $params = [];
    
    // Use property_exists to detect null values instead of isset to handle assigned_to_id properly
    if (property_exists($data, 'description')) {
        $query_parts[] = "description = :description";
        $params[':description'] = $data->description;
    }
    
    if (property_exists($data, 'status')) {
        $query_parts[] = "status = :status";
        $params[':status'] = $data->status;
    }
    
    if (property_exists($data, 'assigned_to_id')) {
        $query_parts[] = "assigned_to_id = :assigned_to_id";
        $params[':assigned_to_id'] = $data->assigned_to_id;
    }
    
    if (empty($query_parts)) {
        http_response_code(400);
        echo json_encode(array("message" => "No valid fields to update."));
        exit();
    }
    
    // Build the final query
    $sql = "UPDATE tasks SET " . implode(", ", $query_parts) . " WHERE id = :id";
    $params[':id'] = $data->id;
    
    $stmt = $db->prepare($sql);
    
    // Execute with parameters
    if ($stmt->execute($params)) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(array("message" => "Task updated successfully."));
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Task not found or no changes made."));
        }
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update task."));
    }
    
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(array("message" => "Unable to update task.", "error" => $e->getMessage()));
}
?>