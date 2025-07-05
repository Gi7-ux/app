<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../core/database.php';
require_once '../core/config.php'; // For JWT_SECRET
require_once '../core/utils.php';  // For validate_token function
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

// Validate token
$decoded_token = validate_token_and_get_data();
if (!$decoded_token) {
    // validate_token() already sent http_response_code
    return;
}
// Optional: Add role check if needed, e.g., only admin or project members can create assignments
// if ($decoded_token->data->role !== 'admin' && !is_project_member($decoded_token->data->id, $data->project_id, $db)) {
//     http_response_code(403);
//     echo json_encode(array("message" => "Access denied. You are not authorized to create assignments for this project."));
//     return;
// }


if (
    !empty($data->project_id) &&
    !empty($data->title)
) {
    $query = "INSERT INTO assignments SET project_id = :project_id, title = :title";
    $stmt = $db->prepare($query);

    // Sanitize
    $data->project_id = htmlspecialchars(strip_tags($data->project_id));
    $data->title = htmlspecialchars(strip_tags($data->title));

    $stmt->bindParam(":project_id", $data->project_id);
    $stmt->bindParam(":title", $data->title);

    if ($stmt->execute()) {
        $assignment_id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode(array("message" => "Assignment was created.", "id" => $assignment_id));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create assignment."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create assignment. Data is incomplete. Project ID and title are required."));
}
?>
