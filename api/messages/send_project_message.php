<?php
require_once '../core/database.php';
require_once '../core/utils.php';
header("Content-Type: application/json; charset=UTF-8");

$database = new Database();
$db = $database->connect();
$user = validate_token();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['project_id']) || !isset($data['text'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing data"]);
    exit();
}

$stmt = $db->prepare("INSERT INTO project_messages (project_id, sender, text, timestamp) VALUES (:project_id, :sender, :text, NOW())");
$stmt->bindParam(':project_id', $data['project_id']);
$stmt->bindParam(':sender', $user->name);
$stmt->bindParam(':text', $data['text']);
$stmt->execute();

echo json_encode(["message" => "Message sent"]);
?>
