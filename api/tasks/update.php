<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../core/database.php';
require_once '../core/config.php';
require_once '../core/utils.php';
require_once '../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

$decoded_token = validate_token_and_get_data();
if (!$decoded_token) {
    return;
}
// Optional: Role/permission check

if (
    !empty($data->id) // Task ID is required
    // Other fields (description, status, assigned_to_id) are optional for update
) {
    // Build query dynamically based on provided fields
    $query_parts = [];
    if (isset($data->description)) $query_parts[] = "description = :description";
    if (isset($data->status)) $query_parts[] = "status = :status";
    if (isset($data->assigned_to_id)) $query_parts[] = "assigned_to_id = :assigned_to_id";

    if (empty($query_parts)) {
        http_response_code(400);
        echo json_encode(array("message" => "No fields provided for update."));
        return;
    }

    $query = "UPDATE tasks SET " . implode(", ", $query_parts) . " WHERE id = :id";
    $stmt = $db->prepare($query);

    // Bind parameters
    if (isset($data->description)) {
        $data->description = htmlspecialchars(strip_tags($data->description));
        $stmt->bindParam(":description", $data->description);
    }
    if (isset($data->status)) {
        $data->status = htmlspecialchars(strip_tags($data->status));
        $stmt->bindParam(":status", $data->status);
    }
    if (isset($data->assigned_to_id)) {
        $data->assigned_to_id = $data->assigned_to_id === 'Not Assigned' || $data->assigned_to_id === '' ? null : htmlspecialchars(strip_tags($data->assigned_to_id));
        $stmt->bindParam(":assigned_to_id", $data->assigned_to_id, $data->assigned_to_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
    }

    $data->id = htmlspecialchars(strip_tags($data->id));
    $stmt->bindParam(":id", $data->id);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(array("message" => "Task was updated."));
        } else {
            // Check if task exists
            $check_query = "SELECT id FROM tasks WHERE id = :id";
            $check_stmt = $db->prepare($check_query);
            $check_stmt->bindParam(":id", $data->id);
            $check_stmt->execute();
            if ($check_stmt->rowCount() == 0) {
                 http_response_code(404);
                 echo json_encode(array("message" => "Task not found."));
            } else {
                http_response_code(200); // No change, but successful
                echo json_encode(array("message" => "Task data was the same, no changes made."));
            }
        }
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update task."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to update task. Task ID is required."));
}
?>
