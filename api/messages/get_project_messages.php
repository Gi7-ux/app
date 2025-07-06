<?php
require_once '../core/database.php';
require_once '../core/utils.php';
header("Content-Type: application/json; charset=UTF-8");

$database = new Database();
$db = $database->connect();
$user_data = validate_token(); // Capture user data from the token

$project_id = $_GET['project_id'] ?? null;

if (!is_numeric($project_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid project_id. Must be numeric."]);
    exit();
}

$project_id = (int)$project_id; // Cast to integer for database query

if (!$project_id) { // Check if after casting, it's still not a valid ID (e.g., 0 or null)
    http_response_code(400);
    echo json_encode(["message" => "Missing project_id"]);
    exit();
}

// Permission check: Verify if the user is authorized to access this project's messages
// This assumes a 'projects' table with an 'owner_id' and/or a 'project_members' table
// For simplicity, let's assume a 'projects' table with an 'owner_id' and a 'project_members' table
// You might need to adjust this query based on your actual database schema.

$auth_query = "SELECT COUNT(*) FROM projects p
               LEFT JOIN project_members pm ON p.id = pm.project_id
               WHERE p.id = :project_id
               AND (p.owner_id = :user_id OR pm.user_id = :user_id)";

$auth_stmt = $db->prepare($auth_query);
$auth_stmt->bindParam(':project_id', $project_id);
$auth_stmt->bindParam(':user_id', $user_data->id);
$auth_stmt->execute();
$is_authorized = $auth_stmt->fetchColumn();

if (!$is_authorized) {
    http_response_code(403); // Forbidden
    echo json_encode(["message" => "You are not authorized to access messages for this project."]);
    exit();
}

try {
    $stmt = $db->prepare("SELECT * FROM project_messages WHERE project_id = :project_id ORDER BY timestamp ASC");
    $stmt->bindParam(':project_id', $project_id);
    $stmt->execute();
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($messages);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    exit();
}
?>
