<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once '../core/database.php';
require_once '../core/utils.php';
require_once '../migrations/run_migrations.php';

// Run critical migrations to ensure database schema is up to date
run_critical_migrations();

$database = new Database();
$db = $database->connect();
if ($db === null) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));
$decoded_token = validate_token();
$user_id = $decoded_token->id;

// Mark a specific notification as read, or all if no ID is provided
$query = "UPDATE notifications SET is_read = 1 WHERE user_id = :user_id";
if (!empty($data->notification_id)) {
    $query .= " AND id = :notification_id";
}

$stmt = $db->prepare($query);
$stmt->bindParam(':user_id', $user_id);
if (!empty($data->notification_id)) {
    $stmt->bindParam(':notification_id', $data->notification_id);
}

if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(array("message" => "Notification(s) marked as read."));
} else {
    http_response_code(503);
    echo json_encode(array("message" => "Unable to mark notification(s) as read."));
}
?>
