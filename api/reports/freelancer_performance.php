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

// This query aggregates data for each freelancer
$query = "SELECT 
            u.id,
            u.name,
            u.rate,
            COUNT(DISTINCT p.id) as assigned_projects,
            SUM(tl.hours) as total_hours_logged
          FROM 
            users u
          LEFT JOIN 
            projects p ON u.id = p.freelancer_id
          LEFT JOIN
            time_logs tl ON u.id = tl.user_id
          WHERE
            u.role = 'freelancer'
          GROUP BY
            u.id";

$stmt = $db->prepare($query);
$stmt->execute();

$report_data = $stmt->fetchAll(PDO::FETCH_ASSOC);

http_response_code(200);
echo json_encode($report_data);
?>
