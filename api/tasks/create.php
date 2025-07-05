<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
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
// Optional: Role/permission check (e.g., user must be part of the project)

if (
    !empty($data->assignment_id) &&
    !empty($data->description)
    // status is optional on create, can default in DB or here
    // assigned_to_id is optional on create
) {
    $query = "INSERT INTO tasks SET assignment_id = :assignment_id, description = :description, status = :status, assigned_to_id = :assigned_to_id";
    $stmt = $db->prepare($query);

    $data->assignment_id = htmlspecialchars(strip_tags($data->assignment_id));
    $data->description = htmlspecialchars(strip_tags($data->description));
    $data->status = !empty($data->status) ? htmlspecialchars(strip_tags($data->status)) : 'To Do'; // Default status
    $data->assigned_to_id = !empty($data->assigned_to_id) ? htmlspecialchars(strip_tags($data->assigned_to_id)) : null;


    $stmt->bindParam(":assignment_id", $data->assignment_id);
    $stmt->bindParam(":description", $data->description);
    $stmt->bindParam(":status", $data->status);
    $stmt->bindParam(":assigned_to_id", $data->assigned_to_id, $data->assigned_to_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);


    if ($stmt->execute()) {
        $task_id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode(array("message" => "Task was created.", "id" => $task_id));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create task."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create task. Assignment ID and description are required."));
}
?>
