<?php
require_once '../core/database.php';
require_once '../core/utils.php';
header("Content-Type: application/json; charset=UTF-8");

$database = new Database();
$db = $database->connect();
$user = validate_token();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['project_id']) || !isset($data['title'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing data"]);
    exit();
}

// Insert or update assignment
if (isset($data['id'])) {
    $stmt = $db->prepare("UPDATE assignments SET title=:title WHERE id=:id");
    $stmt->bindParam(':title', $data['title']);
    $stmt->bindParam(':id', $data['id']);
    $stmt->execute();
    $assignment_id = $data['id'];
} else {
    $stmt = $db->prepare("INSERT INTO assignments (project_id, title) VALUES (:project_id, :title)");
    $stmt->bindParam(':project_id', $data['project_id']);
    $stmt->bindParam(':title', $data['title']);
    $stmt->execute();
    $assignment_id = $db->lastInsertId();
}

// Save tasks if provided
if (isset($data['tasks'])) {
    foreach ($data['tasks'] as $task) {
        if (isset($task['id'])) {
            $stmt = $db->prepare("UPDATE tasks SET description=:description, assigned_to=:assigned_to, status=:status WHERE id=:id");
            $stmt->bindParam(':description', $task['description']);
            $stmt->bindParam(':assigned_to', $task['assignedTo']);
            $stmt->bindParam(':status', $task['status']);
            $stmt->bindParam(':id', $task['id']);
            $stmt->execute();
        } else {
            $stmt = $db->prepare("INSERT INTO tasks (assignment_id, description, assigned_to, status) VALUES (:assignment_id, :description, :assigned_to, :status)");
            $stmt->bindParam(':assignment_id', $assignment_id);
            $stmt->bindParam(':description', $task['description']);
            $stmt->bindParam(':assigned_to', $task['assignedTo']);
            $stmt->bindParam(':status', $task['status']);
            $stmt->execute();
        }
    }
}

echo json_encode(["message" => "Assignment saved", "assignment_id" => $assignment_id]);
?>
