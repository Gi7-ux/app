<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, DELETE");
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

if (!empty($data->id)) {
    $query = "DELETE FROM tasks WHERE id = :id";
    $stmt = $db->prepare($query);

    $data->id = htmlspecialchars(strip_tags($data->id));
    $stmt->bindParam(':id', $data->id);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(array("message" => "Task was deleted."));
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Task not found."));
        }
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete task."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to delete task. ID is missing."));
}
?>
