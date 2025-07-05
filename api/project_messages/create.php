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

$decoded_token_data = validate_token_and_get_data();
if (!$decoded_token_data) {
    return;
}
$sender_id = $decoded_token_data->data->id; // Get sender_id from token

if (
    !empty($data->project_id) &&
    !empty($data->message_text) &&
    !empty($sender_id)
) {
    // Optional: Check if project exists and if sender is part of the project
    // $project_exists_query = "SELECT id FROM projects WHERE id = :project_id";
    // $project_stmt = $db->prepare($project_exists_query);
    // $project_stmt->bindParam(':project_id', $data->project_id);
    // $project_stmt->execute();
    // if($project_stmt->rowCount() == 0) {
    //     http_response_code(404);
    //     echo json_encode(array("message" => "Project not found."));
    //     return;
    // }
    // Add more validation if user must be a participant in the project to send messages.

    $query = "INSERT INTO project_messages SET project_id = :project_id, user_id = :user_id, message_text = :message_text";
    $stmt = $db->prepare($query);

    $data->project_id = htmlspecialchars(strip_tags($data->project_id));
    $data->message_text = htmlspecialchars(strip_tags($data->message_text));
    // sender_id is from token, assumed to be safe

    $stmt->bindParam(":project_id", $data->project_id);
    $stmt->bindParam(":user_id", $sender_id);
    $stmt->bindParam(":message_text", $data->message_text);

    if ($stmt->execute()) {
        $message_id = $db->lastInsertId();
        // Return the created message object, including sender name and timestamp, for easier frontend update
        $created_message_query = "SELECT pm.id, pm.project_id, pm.message_text, pm.created_at, u.name as sender_name
                                  FROM project_messages pm
                                  JOIN users u ON pm.user_id = u.id
                                  WHERE pm.id = :message_id";
        $created_stmt = $db->prepare($created_message_query);
        $created_stmt->bindParam(":message_id", $message_id);
        $created_stmt->execute();
        $created_message = $created_stmt->fetch(PDO::FETCH_ASSOC);

        http_response_code(201);
        echo json_encode(array("message" => "Message was sent.", "data" => $created_message));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to send message."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to send message. Project ID and message text are required."));
}
?>
