<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../core/database.php';
require_once '../core/utils.php';


$database = new Database();
$db = $database->connect();
if ($db === null) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

$data = validate_token();

if ($data->role !== 'admin') {
    http_response_code(403);
    echo json_encode(array("message" => "Access denied."));
    return;
}

// This query calculates progress and financial status for each project
$query = "SELECT 
            p.id,
            p.title,
            p.status,
            p.budget,
            p.deadline,
            c.name as client_name,
            (SELECT SUM(hours) FROM time_logs WHERE project_id = p.id) as hours_logged,
            (SELECT COUNT(*) FROM tasks WHERE assignment_id IN (SELECT id FROM assignments WHERE project_id = p.id)) as total_tasks,
            (SELECT COUNT(*) FROM tasks WHERE status = 'Done' AND assignment_id IN (SELECT id FROM assignments WHERE project_id = p.id)) as completed_tasks
          FROM 
            projects p
          JOIN
            users c ON p.client_id = c.id
          ORDER BY
            p.deadline ASC";

$stmt = $db->prepare($query);
$stmt->execute();

$report_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

http_response_code(200);
echo json_encode($report_data);
?>
