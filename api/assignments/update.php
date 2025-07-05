<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT"); // Allow PUT as well
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

if (
    !empty($data->id) &&
    !empty($data->title)
) {
    // Optional: Add role/permission check to ensure user can update this assignment
    // For example, check if user is admin or project manager for the project this assignment belongs to

    $query = "UPDATE assignments SET title = :title WHERE id = :id";
    $stmt = $db->prepare($query);

    $data->id = htmlspecialchars(strip_tags($data->id));
    $data->title = htmlspecialchars(strip_tags($data->title));

    $stmt->bindParam(":title", $data->title);
    $stmt->bindParam(":id", $data->id);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(array("message" => "Assignment was updated."));
        } else {
            http_response_code(404); // Or 200 if no change is not an error
            echo json_encode(array("message" => "Assignment not found or title is the same."));
        }
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update assignment."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to update assignment. ID and title are required."));
}
?>
