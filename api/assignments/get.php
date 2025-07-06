<?php
require_once '../core/database.php';
require_once '../core/utils.php';
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$database = new Database();
$db = $database->connect();
$decoded_token = validate_token();
$user_id = $decoded_token->user_id; // Assuming user_id is in the token data

$project_id = $_GET['project_id'] ?? null;
if (!$project_id) {
    http_response_code(400);
    echo json_encode(["message" => "Missing project_id"]);
    exit();
}

// Check project authorization
if (!check_project_permission($db, $user_id, $project_id)) {
    http_response_code(403);
    echo json_encode(["message" => "Access denied. You do not have permission to view this project's assignments."]);
    exit();
}

$stmt = $db->prepare("SELECT * FROM assignments WHERE project_id = :project_id");
$stmt->bindParam(':project_id', $project_id);
$stmt->execute();
$assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

$assignment_ids = array_column($assignments, 'id');
if (!empty($assignment_ids)) {
    $placeholders = implode(',', array_fill(0, count($assignment_ids), '?'));
    $stmt_tasks = $db->prepare("SELECT * FROM tasks WHERE assignment_id IN ($placeholders)");
    $stmt_tasks->execute($assignment_ids);
    $tasks = $stmt_tasks->fetchAll(PDO::FETCH_ASSOC);

    $tasks_by_assignment = [];
    foreach ($tasks as $task) {
        $tasks_by_assignment[$task['assignment_id']][] = $task;
    }

    foreach ($assignments as &$assignment) {
        $assignment['tasks'] = $tasks_by_assignment[$assignment['id']] ?? [];
    }
} else {
    foreach ($assignments as &$assignment) {
        $assignment['tasks'] = [];
    }
}

echo json_encode($assignments);
?>
