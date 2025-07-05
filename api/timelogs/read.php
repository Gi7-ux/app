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

$query = "SELECT 
            tl.id,
            u.name as freelancerName,
            p.title as projectName,
            t.description as taskDescription,
            tl.hours,
            tl.log_date
          FROM 
            time_logs tl
          JOIN
            users u ON tl.user_id = u.id
          JOIN
            projects p ON tl.project_id = p.id
          JOIN
            tasks t ON tl.task_id = t.id
          ORDER BY
            tl.log_date DESC";

$stmt = $db->prepare($query);
$stmt->execute();

$logs_arr = array();
$logs_arr["records"] = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    extract($row);
    $log_item = array(
        "id" => $id,
        "freelancerName" => $freelancerName,
        "projectName" => $projectName,
        "taskDescription" => $taskDescription,
        "hours" => $hours,
        "date" => $log_date
    );
    array_push($logs_arr["records"], $log_item);
}

http_response_code(200);
echo json_encode($logs_arr);
?>
