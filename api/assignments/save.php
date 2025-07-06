<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}
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

// Check if the authenticated user has permission for the specified project
if (!check_project_permission($db, $user->id, $data['project_id'])) {
    http_response_code(403);
    echo json_encode(["message" => "Forbidden: You do not have permission to modify assignments for this project."]);
    exit();
}

try {
    $db->beginTransaction();

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

    $db->commit();
    echo json_encode(["message" => "Assignment saved", "assignment_id" => $assignment_id]);

} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(["message" => "Transaction failed: " . $e->getMessage()]);
}
?>
