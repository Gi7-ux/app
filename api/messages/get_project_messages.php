<?php
require_once '../core/database.php';
require_once '../core/utils.php';
header("Content-Type: application/json; charset=UTF-8");

$database = new Database();
$db = $database->connect();
validate_token();

$project_id = $_GET['project_id'] ?? null;
if (!$project_id) {
    http_response_code(400);
    echo json_encode(["message" => "Missing project_id"]);
    exit();
}

$stmt = $db->prepare("SELECT * FROM project_messages WHERE project_id = :project_id ORDER BY timestamp ASC");
$stmt->bindParam(':project_id', $project_id);
$stmt->execute();
$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($messages);
?>
