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

require_once '../../core/database.php';
require_once '../../core/utils.php';
require_once '../../core/config.php';
require_once '../../vendor/autoload.php';

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
if (empty($data->project_id) || empty($data->skill_name)) {
    http_response_code(400);
    echo json_encode(array("message" => "Project ID and skill name are required."));
    exit();
}

try {
    // Check if project_skills table exists
    if (!table_exists($db, 'project_skills')) {
        http_response_code(500);
        echo json_encode(array("message" => "Project skills table does not exist."));
        exit();
    }
    
    // Remove skill association
    $sql = "DELETE FROM project_skills WHERE project_id = :project_id AND skill_name = :skill_name";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':project_id', $data->project_id);
    $stmt->bindParam(':skill_name', $data->skill_name);
    
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(array("message" => "Skill removed successfully."));
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Skill not found for this project."));
        }
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to remove skill."));
    }
    
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(array("message" => "Unable to remove skill.", "error" => $e->getMessage()));
}
?>