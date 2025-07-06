<?php
require_once '../core/database.php';
require_once '../core/utils.php';
header("Content-Type: application/json; charset=UTF-8");

$database = new Database();
$db = $database->connect();
$user = validate_token();
if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized: Invalid or missing token."]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['project_id']) || !isset($data['text'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing data"]);
    exit();
}

$text = trim($data['text']);
$maxLength = 1000; // Define a reasonable maximum length for the message

if (strlen($text) > $maxLength) {
    http_response_code(400);
    echo json_encode(["message" => "Message too long. Maximum length is " . $maxLength . " characters."]);
    exit();
}

// Sanitize the input to prevent harmful content
$text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');

try {
    $stmt = $db->prepare("INSERT INTO project_messages (project_id, sender, text, timestamp) VALUES (:project_id, :sender, :text, NOW())");
    $stmt->bindParam(':project_id', $data['project_id']);
    $sender = $user->name ?? $user->email;
    $stmt->bindParam(':sender', $sender);
    $stmt->bindParam(':text', $text);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["message" => "Failed to send message: Database error.", "error" => $stmt->errorInfo()]);
        exit();
    }
    echo json_encode(["message" => "Message sent"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Failed to send message: " . $e->getMessage()]);
    exit();
}
?>
