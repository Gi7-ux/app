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

$stmt = $db->prepare("SELECT * FROM assignments WHERE project_id = :project_id");
$stmt->bindParam(':project_id', $project_id);
$stmt->execute();
$assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($assignments as &$assignment) {
    $stmt2 = $db->prepare("SELECT * FROM tasks WHERE assignment_id = :assignment_id");
    $stmt2->bindParam(':assignment_id', $assignment['id']);
    $stmt2->execute();
    $assignment['tasks'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode($assignments);
?>
